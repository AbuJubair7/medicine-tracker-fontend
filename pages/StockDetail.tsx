
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit2, Trash2, Pill, Sun, Clock, Moon, Loader2, AlertCircle } from 'lucide-react';
import { stockService } from '../services/stockService';
import { Stock, Medicine } from '../types';
import Modal from '../components/Modal';
import DeleteMedicineModal from '../components/modals/DeleteMedicineModal';

const StockDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Medicine Form State
  const [medForm, setMedForm] = useState({
    name: '',
    dose: '',
    quantity: '',
    takeMorning: false,
    takeAfternoon: false,
    takeEvening: false
  });

  const navigate = useNavigate();

  const fetchStock = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await stockService.getOne(id);
      setStock(data);
    } catch (err) {
      console.error('Failed to fetch stock', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [id]);

  const resetForm = () => {
    setMedForm({
      name: '',
      dose: '',
      quantity: '',
      takeMorning: false,
      takeAfternoon: false,
      takeEvening: false
    });
    setEditingMed(null);
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setActionLoading(true);
      const payload = {
        ...medForm,
        dose: parseFloat(medForm.dose) || 0,
        quantity: parseInt(medForm.quantity) || 0
      };

      if (editingMed) {
        const updatedMed = await stockService.editMedicine(editingMed.id, payload);
        // Optimistically update the list
        setStock(prev => {
          if (!prev) return null;
          return {
            ...prev,
            medicines: prev.medicines.map(m => m.id === updatedMed.id ? updatedMed : m)
          };
        });
      } else {
        const updatedStock = await stockService.addMedicine(id, payload);
        setStock(updatedStock);
      }
      setIsMedModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Failed to save medicine', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (med: Medicine) => {
    setEditingMed(med);
    setMedForm({
      name: med.name,
      dose: med.dose.toString(),
      quantity: med.quantity.toString(),
      takeMorning: med.takeMorning,
      takeAfternoon: med.takeAfternoon,
      takeEvening: med.takeEvening
    });
    setIsMedModalOpen(true);
  };

  // Delete Medicine Modal State
  const [deleteMedModalOpen, setDeleteMedModalOpen] = useState(false);
  const [medToDelete, setMedToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (medId: number) => {
    setMedToDelete(medId);
    setDeleteMedModalOpen(true);
  };

  const confirmDeleteMed = async () => {
    if (!medToDelete) return;
    try {
      setDeleteLoading(true);
      await stockService.deleteMedicine(medToDelete);
      setStock(prev => {
        if (!prev) return null;
        return {
          ...prev,
          medicines: prev.medicines.filter(m => m.id !== medToDelete)
        };
      });
      setDeleteMedModalOpen(false);
    } catch (err) {
      console.error('Failed to delete medicine', err);
    } finally {
      setDeleteLoading(false);
      setMedToDelete(null); 
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-slate-500">Retrieving medications...</p>
    </div>
  );

  if (!stock) return null;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors font-semibold"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1">
              <img src="/favicon.svg" alt="Stock Icon" className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{stock.name}</h1>
          </div>
          <p className="text-slate-500 font-medium">Inventory of {stock.medicines?.length || 0} medications</p>
        </div>

        <button 
          onClick={() => {
            resetForm();
            setIsMedModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Medication
        </button>
      </div>

      {/* 3-Column Schedule Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Morning Column */}
        <div className="bg-orange-50/50 rounded-[2.5rem] p-6 border border-orange-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Sun className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Morning</h2>
          </div>
          <div className="space-y-4">
            {stock.medicines?.filter(m => m.takeMorning).map(med => (
              <React.Fragment key={`${med.id}-morning`}>
                <MedicineCard 
                  med={med} 
                  onEdit={() => handleEditClick(med)} 
                  onDelete={() => handleDeleteClick(med.id)}
                />
              </React.Fragment>
            ))}
            {(!stock.medicines || !stock.medicines.some(m => m.takeMorning)) && (
              <EmptyState message="No morning meds" />
            )}
          </div>
        </div>

        {/* Noon Column */}
        <div className="bg-blue-50/50 rounded-[2.5rem] p-6 border border-blue-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Noon</h2>
          </div>
          <div className="space-y-4">
            {stock.medicines?.filter(m => m.takeAfternoon).map(med => (
              <React.Fragment key={`${med.id}-noon`}>
                <MedicineCard 
                  med={med} 
                  onEdit={() => handleEditClick(med)} 
                  onDelete={() => handleDeleteClick(med.id)}
                />
              </React.Fragment>
            ))}
            {(!stock.medicines || !stock.medicines.some(m => m.takeAfternoon)) && (
              <EmptyState message="No noon meds" />
            )}
          </div>
        </div>

        {/* Evening Column */}
        <div className="bg-indigo-50/50 rounded-[2.5rem] p-6 border border-indigo-100/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Moon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Evening</h2>
          </div>
          <div className="space-y-4">
            {stock.medicines?.filter(m => m.takeEvening).map(med => (
              <React.Fragment key={`${med.id}-evening`}>
                <MedicineCard 
                  med={med} 
                  onEdit={() => handleEditClick(med)} 
                  onDelete={() => handleDeleteClick(med.id)}
                />
              </React.Fragment>
            ))}
            {(!stock.medicines || !stock.medicines.some(m => m.takeEvening)) && (
              <EmptyState message="No evening meds" />
            )}
          </div>
        </div>
      </div>

      <Modal  
        isOpen={isMedModalOpen} 
        onClose={() => setIsMedModalOpen(false)} 
        title={editingMed ? "Edit Medication" : "Add New Medication"}
      >
        <form onSubmit={handleAddMedicine} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Medicine Name</label>
              <input 
                required
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={medForm.name}
                onChange={e => setMedForm({...medForm, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Dose (mg/ml)</label>
                <input 
                  type="text"
                  placeholder="e.g., 500mg"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={medForm.dose}
                  onChange={e => setMedForm({...medForm, dose: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Quantity</label>
                <input 
                  type="text"
                  placeholder="e.g., 20 pills"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={medForm.quantity}
                  onChange={e => setMedForm({...medForm, quantity: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Daily Schedule</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMedForm({...medForm, takeMorning: !medForm.takeMorning})}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${medForm.takeMorning ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100 text-slate-400 bg-slate-50'}`}
                >
                  <Sun className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase">Morning</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMedForm({...medForm, takeAfternoon: !medForm.takeAfternoon})}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${medForm.takeAfternoon ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 bg-slate-50'}`}
                >
                  <Clock className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase">Noon</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMedForm({...medForm, takeEvening: !medForm.takeEvening})}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${medForm.takeEvening ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 bg-slate-50'}`}
                >
                  <Moon className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase">Night</span>
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={actionLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            {actionLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {editingMed ? "Update Medicine" : "Add to Stock"}
          </button>
        </form>
      </Modal>

      <DeleteMedicineModal
        isOpen={deleteMedModalOpen}
        onClose={() => setDeleteMedModalOpen(false)}
        onConfirm={confirmDeleteMed}
        loading={deleteLoading}
      />
    </div>
  );
};

export default StockDetail;

const MedicineCard = ({ med, onEdit, onDelete }: { med: Medicine; onEdit: () => void; onDelete: () => void }) => (
  <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-bold text-slate-800 text-lg">{med.name}</h4>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
      <span>{med.dose} mg</span>
      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
        Number(med.quantity) <= 5 ? 'bg-red-50 text-red-600 border border-red-100' : 
        Number(med.quantity) <= 10 ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
        'bg-emerald-50 text-emerald-600 border border-emerald-100'
      }`}>
        {med.quantity} left
      </span>
    </div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-8 text-slate-400">
    <p className="text-sm font-medium italic">{message}</p>
  </div>
);
