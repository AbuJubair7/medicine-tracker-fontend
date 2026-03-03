
import { useEffect, useState, type FC, type FormEvent, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Minus, Edit2, Trash2, Sun, Clock, Moon, Loader2, Share2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { stockService } from '@/services/stockService';
import { Stock, Medicine } from '@/types';
import Modal from '@/components/Modal';
import DeleteMedicineModal from '@/components/modals/DeleteMedicineModal';
import EditStockModal from '../components/modals/EditStockModal';
import ShareStockModal from '../components/modals/ShareStockModal';
import DailyDoseSummary from '../components/stock/DailyDoseSummary';
import MedicineTimeline from '../components/stock/MedicineTimeline';
import './StockDetail.css';

const MORNING_HOURS = [6, 7, 8, 9, 10, 11];
const AFTERNOON_HOURS = [12, 13, 14, 15, 16, 17, 18];
const EVENING_HOURS = [19, 20, 21, 22, 23];
type ScheduleSlot = 'morning' | 'afternoon' | 'evening';

const formatHourLabel = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

const StockDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [expandedSlot, setExpandedSlot] = useState<ScheduleSlot | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditStockModalOpen, setIsEditStockModalOpen] = useState(false);
  const [editStockLoading, setEditStockLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [medForm, setMedForm] = useState({
    name: '', dose: '', quantity: '',
    takeMorning: false, takeAfternoon: false, takeEvening: false,
    morningTime: '9', afternoonTime: '14', eveningTime: '21'
  });
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const fetchStock = async () => {
    if (!id) return;
    try { setLoading(true); const data = await stockService.getOne(id); setStock(data); }
    catch (err) { console.error('Failed to fetch stock', err); navigate('/dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStock(); }, [id]);

  const resetForm = () => {
    setMedForm({ name: '', dose: '', quantity: '', takeMorning: false, takeAfternoon: false, takeEvening: false, morningTime: '9', afternoonTime: '14', eveningTime: '21' });
    setExpandedSlot(null);
    setEditingMed(null);
  };

  const toggleSchedule = (slot: ScheduleSlot) => {
    const isActive = slot === 'morning'
      ? medForm.takeMorning
      : slot === 'afternoon'
        ? medForm.takeAfternoon
        : medForm.takeEvening;

    setMedForm(prev => ({
      ...prev,
      ...(slot === 'morning' && { takeMorning: !prev.takeMorning }),
      ...(slot === 'afternoon' && { takeAfternoon: !prev.takeAfternoon }),
      ...(slot === 'evening' && { takeEvening: !prev.takeEvening }),
    }));

    if (isActive) {
      setExpandedSlot(prev => (prev === slot ? null : prev));
      return;
    }
    setExpandedSlot(slot);
  };

  const handleAddMedicine = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    if (!medForm.takeMorning && !medForm.takeAfternoon && !medForm.takeEvening) {
      alert("Please select at least one time slot (Morning, Noon, or Night) for this medicine.");
      return;
    }

    try {
      setActionLoading(true);
      const payload = { ...medForm, dose: parseFloat(medForm.dose) || 0, quantity: parseInt(medForm.quantity) || 0, morningTime: parseInt(medForm.morningTime as string) || 0, afternoonTime: parseInt(medForm.afternoonTime as string) || 0, eveningTime: parseInt(medForm.eveningTime as string) || 0 };
      if (editingMed) {
        const updatedMed = await stockService.editMedicine(editingMed.id, payload);
        setStock(prev => prev ? { ...prev, medicines: prev.medicines.map(m => m.id === updatedMed.id ? updatedMed : m) } : null);
      } else {
        const newMedicine = await stockService.addMedicine(id, payload);
        setStock(prev => prev ? { ...prev, medicines: [...(prev.medicines || []), newMedicine] } : null);
      }
      setIsMedModalOpen(false); resetForm();
    } catch (err) { console.error('Failed to save medicine', err); }
    finally { setActionLoading(false); }
  };

  const handleRenameStock = async (newName: string) => {
    if (!id || !stock) return;
    try { setEditStockLoading(true); const updatedStock = await stockService.update(id, newName); setStock(prev => prev ? { ...prev, name: updatedStock.name } : null); setIsEditStockModalOpen(false); }
    catch (err) { console.error('Failed to update stock name', err); }
    finally { setEditStockLoading(false); }
  };

  const handleEditClick = (med: Medicine) => {
    setEditingMed(med);
    const initialExpanded = med.takeMorning ? 'morning' : med.takeAfternoon ? 'afternoon' : med.takeEvening ? 'evening' : null;
    setExpandedSlot(initialExpanded);
    setMedForm({ name: med.name, dose: med.dose.toString(), quantity: med.quantity.toString(), takeMorning: med.takeMorning, takeAfternoon: med.takeAfternoon, takeEvening: med.takeEvening, morningTime: med.morningTime?.toString() || '9', afternoonTime: med.afternoonTime?.toString() || '14', eveningTime: med.eveningTime?.toString() || '21' });
    setIsMedModalOpen(true);
  };

  const [deleteMedModalOpen, setDeleteMedModalOpen] = useState(false);
  const [medToDelete, setMedToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (medId: number) => { setMedToDelete(medId); setDeleteMedModalOpen(true); };

  const confirmDeleteMed = async () => {
    if (!medToDelete) return;
    try { setDeleteLoading(true); await stockService.deleteMedicine(medToDelete); setStock(prev => prev ? { ...prev, medicines: prev.medicines.filter(m => m.id !== medToDelete) } : null); setDeleteMedModalOpen(false); }
    catch (err) { console.error('Failed to delete medicine', err); }
    finally { setDeleteLoading(false); setMedToDelete(null); }
  };

  const handleQuantityChange = async (medId: number, delta: number) => {
    const med = stock?.medicines?.find(m => m.id === medId);
    if (!med) return;
    const newQty = Math.max(0, Number(med.quantity) + delta);
    // Optimistic update
    setStock(prev => prev ? { ...prev, medicines: prev.medicines.map(m => m.id === medId ? { ...m, quantity: newQty } : m) } : null);
    try {
      await stockService.editMedicine(medId, { quantity: newQty });
    } catch (err) {
      console.error('Failed to update quantity', err);
      // Revert on error
      setStock(prev => prev ? { ...prev, medicines: prev.medicines.map(m => m.id === medId ? { ...m, quantity: med.quantity } : m) } : null);
    }
  };

  if (loading) return (
    <div className="dashboard-loading" style={{ minHeight: '60vh' }}>
      <Loader2 size={40} color="var(--primary)" className="animate-spin" />
      <p className="loading-text">Retrieving medications...</p>
    </div>
  );

  if (!stock) return null;

  return (
    <div className="detail-container animate-fade-in">
      <button onClick={() => navigate('/dashboard')} className="back-btn">
        <ChevronLeft size={20} /> Back to Dashboard
      </button>

      <div className="detail-header-section">
        <div>
          <div className="detail-title-group">
            <div className="detail-icon-wrapper">
              <img src="/favicon.svg" alt="Stock Icon" className="detail-icon" />
            </div>
            <h1 className="detail-title">{stock.name}</h1>
            <button onClick={() => setIsEditStockModalOpen(true)} className="btn-icon">
              <Edit2 size={20} />
            </button>
          </div>
          <p className="detail-subtitle">Inventory of {stock.medicines?.length || 0} medications</p>
        </div>
        
        <div className="detail-actions">
          <button onClick={() => setIsShareModalOpen(true)} className="btn btn-secondary glass-card">
            <Share2 size={20} /> Share
          </button>
          <button onClick={() => { resetForm(); setIsMedModalOpen(true); }} className="btn btn-primary">
            <Plus size={20} /> Add Medication
          </button>
        </div>
      </div>

      <DailyDoseSummary medicines={stock.medicines || []} />
      <MedicineTimeline medicines={stock.medicines || []} />

      {/* 3-Column Schedule Layout */}
      <div className="schedule-grid">
        {/* Morning */}
        <div className="glass-card schedule-column morning">
          <div className="schedule-header">
            <div className="schedule-icon-wrapper"><Sun size={20} /></div>
            <h2 className="schedule-title">Morning</h2>
          </div>
          <div className="schedule-content">
            {stock.medicines?.filter(m => m.takeMorning).map(med => (
              <Fragment key={`${med.id}-morning`}><MedicineCard med={med} onEdit={() => handleEditClick(med)} onDelete={() => handleDeleteClick(med.id)} onQuantityChange={handleQuantityChange} isDark={isDark} /></Fragment>
            ))}
            {(!stock.medicines || !stock.medicines.some(m => m.takeMorning)) && <EmptyState message="No morning meds" />}
          </div>
        </div>

        {/* Noon */}
        <div className="glass-card schedule-column noon">
          <div className="schedule-header">
            <div className="schedule-icon-wrapper"><Clock size={20} /></div>
            <h2 className="schedule-title">Noon</h2>
          </div>
          <div className="schedule-content">
            {stock.medicines?.filter(m => m.takeAfternoon).map(med => (
              <Fragment key={`${med.id}-noon`}><MedicineCard med={med} onEdit={() => handleEditClick(med)} onDelete={() => handleDeleteClick(med.id)} onQuantityChange={handleQuantityChange} isDark={isDark} /></Fragment>
            ))}
            {(!stock.medicines || !stock.medicines.some(m => m.takeAfternoon)) && <EmptyState message="No noon meds" />}
          </div>
        </div>

        {/* Evening */}
        <div className="glass-card schedule-column evening">
          <div className="schedule-header">
            <div className="schedule-icon-wrapper"><Moon size={20} /></div>
            <h2 className="schedule-title">Evening</h2>
          </div>
          <div className="schedule-content">
            {stock.medicines?.filter(m => m.takeEvening).map(med => (
              <Fragment key={`${med.id}-evening`}><MedicineCard med={med} onEdit={() => handleEditClick(med)} onDelete={() => handleDeleteClick(med.id)} onQuantityChange={handleQuantityChange} isDark={isDark} /></Fragment>
            ))}
            {(!stock.medicines || !stock.medicines.some(m => m.takeEvening)) && <EmptyState message="No evening meds" />}
          </div>
        </div>
      </div>

      {/* Add/Edit Medicine Modal */}
      <Modal 
        isOpen={isMedModalOpen} 
        onClose={() => { setIsMedModalOpen(false); setExpandedSlot(null); }}
        title={editingMed ? "Edit Medication" : "Add New Medication"}
        footer={
          <button type="submit" form="add-med-form" disabled={actionLoading} className="modal-action-btn med-modal-submit-btn">
            {actionLoading ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : editingMed ? "Update Medicine" : "Add to Stock"}
          </button>
        }
      >
        <form id="add-med-form" onSubmit={handleAddMedicine} className="med-modal-form">
          <div className="med-modal-intro">
            <p className="med-modal-intro-title">
              {editingMed ? 'Adjust medication details' : 'Capture medication details'}
            </p>
            <p className="med-modal-intro-text">
              Add dose, quantity, and schedule so stock tracking stays accurate.
            </p>
          </div>

          <div className="modal-form-group med-modal-field">
            <label className="modal-form-label">Medicine Name</label>
            <input
              required
              type="text"
              className="modal-form-input"
              placeholder="e.g., Amoxicillin"
              value={medForm.name}
              onChange={e => setMedForm({ ...medForm, name: e.target.value })}
            />
          </div>

          <div className="med-modal-grid">
            <div className="modal-form-group med-modal-field">
              <label className="modal-form-label">Dose (mg/ml)</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g., 500.5"
                className="modal-form-input"
                value={medForm.dose}
                onChange={e => setMedForm({ ...medForm, dose: e.target.value })}
              />
            </div>
            <div className="modal-form-group med-modal-field">
              <label className="modal-form-label">Quantity</label>
              <input
                type="number"
                min="0"
                placeholder="e.g., 20"
                className="modal-form-input"
                value={medForm.quantity}
                onChange={e => setMedForm({ ...medForm, quantity: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-form-group med-modal-field">
            <div className="med-schedule-header">
              <label className="modal-form-label">Daily Schedule</label>
              <span className="med-schedule-hint">Select one or more time slots</span>
            </div>
            <div className="med-schedule-grid">
              <div className={`med-schedule-card morning ${medForm.takeMorning ? 'active expanded' : ''}`}>
                <button
                  type="button"
                  onClick={() => setMedForm({...medForm, takeMorning: !medForm.takeMorning})}
                  className="med-schedule-toggle"
                  aria-pressed={medForm.takeMorning}
                >
                  <Sun size={18} />
                  <span>Morning</span>
                </button>
                {medForm.takeMorning && (
                  <div className="med-time-picker">
                    <label className="med-time-label">Time</label>
                    <select
                      className="modal-form-input med-time-select"
                      value={medForm.morningTime}
                      onChange={e => setMedForm({ ...medForm, morningTime: e.target.value })}
                    >
                      {MORNING_HOURS.map(hour => (
                        <option key={hour} value={hour}>
                          {formatHourLabel(hour)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className={`med-schedule-card noon ${medForm.takeAfternoon ? 'active expanded' : ''}`}>
                <button
                  type="button"
                  onClick={() => setMedForm({...medForm, takeAfternoon: !medForm.takeAfternoon})}
                  className="med-schedule-toggle"
                  aria-pressed={medForm.takeAfternoon}
                >
                  <Clock size={18} />
                  <span>Noon</span>
                </button>
                {medForm.takeAfternoon && (
                  <div className="med-time-picker">
                    <label className="med-time-label">Time</label>
                    <select
                      className="modal-form-input med-time-select"
                      value={medForm.afternoonTime}
                      onChange={e => setMedForm({ ...medForm, afternoonTime: e.target.value })}
                    >
                      {AFTERNOON_HOURS.map(hour => (
                        <option key={hour} value={hour}>
                          {formatHourLabel(hour)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className={`med-schedule-card evening ${medForm.takeEvening ? 'active expanded' : ''}`}>
                <button
                  type="button"
                  onClick={() => setMedForm({...medForm, takeEvening: !medForm.takeEvening})}
                  className="med-schedule-toggle"
                  aria-pressed={medForm.takeEvening}
                >
                  <Moon size={18} />
                  <span>Night</span>
                </button>
                {medForm.takeEvening && (
                  <div className="med-time-picker">
                    <label className="med-time-label">Time</label>
                    <select
                      className="modal-form-input med-time-select"
                      value={medForm.eveningTime}
                      onChange={e => setMedForm({ ...medForm, eveningTime: e.target.value })}
                    >
                      {EVENING_HOURS.map(hour => (
                        <option key={hour} value={hour}>
                          {formatHourLabel(hour)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <DeleteMedicineModal isOpen={deleteMedModalOpen} onClose={() => setDeleteMedModalOpen(false)} onConfirm={confirmDeleteMed} loading={deleteLoading} />
      <EditStockModal isOpen={isEditStockModalOpen} onClose={() => setIsEditStockModalOpen(false)} onSubmit={handleRenameStock} loading={editStockLoading} initialName={stock.name} />
      <ShareStockModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} stock={stock} />
    </div>
  );
};

export default StockDetail;

const MedicineCard = ({ med, onEdit, onDelete, onQuantityChange, isDark }: { med: Medicine; onEdit: () => void; onDelete: () => void; onQuantityChange: (medId: number, delta: number) => void; isDark: boolean }) => {
  const qty = Number(med.quantity);
  const qtyColorClass = qty <= 5 ? 'qty-danger' : qty >= 10 ? 'qty-success' : 'qty-warning';
  
  return (
    <div className="glass-card med-card">
      <div className="med-card-header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="med-name-group">
            <h4 className="med-name">{med.name}</h4>
            <span className="med-dose">{med.dose} mg</span>
          </div>
          
          <div className="med-qty-control">
            <button
              onClick={(e) => { e.stopPropagation(); onQuantityChange(med.id, -1); }}
              disabled={qty <= 0}
              className="med-qty-btn"
            >
              <Minus size={16} />
            </button>
            <span className={`med-qty-display ${qtyColorClass}`}>{med.quantity}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onQuantityChange(med.id, 1); }}
              className="med-qty-btn"
            >
              <Plus size={16} />
            </button>
            <span className="med-dose" style={{ marginLeft: '4px' }}>left</span>
          </div>
        </div>
        
        <div className="med-actions">
          <button onClick={onEdit} className="med-action-btn edit"><Edit2 size={16} /></button>
          <button onClick={onDelete} className="med-action-btn delete"><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
    <p style={{ fontSize: '0.875rem', fontWeight: 500, fontStyle: 'italic' }}>{message}</p>
  </div>
);
