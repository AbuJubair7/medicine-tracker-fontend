
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Package, ArrowRight, Loader2, Search } from 'lucide-react';
import { stockService } from '../services/stockService';
import { Stock } from '../types';
import Modal from '../components/Modal';

const Dashboard: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStockName, setNewStockName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const data = await stockService.getAll();
      setStocks(data);
    } catch (err) {
      console.error('Failed to fetch stocks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleCreateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockName.trim()) return;
    
    try {
      setActionLoading(true);
      await stockService.create(newStockName);
      setNewStockName('');
      setIsModalOpen(false);
      fetchStocks();
    } catch (err) {
      console.error('Failed to create stock', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!stockToDelete) return;
    
    // Optimistic update
    const previousStocks = [...stocks];
    setStocks(stocks.filter(s => s.id !== parseInt(stockToDelete)));
    setIsModalOpen(false); // Close create modal if open
    setDeleteModalOpen(false);

    try {
      await stockService.delete(stockToDelete);
    } catch (err) {
      console.error('Failed to delete stock', err);
      // Revert if failed
      setStocks(previousStocks);
      alert('Failed to delete stock');
    } finally {
      setStockToDelete(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setStockToDelete(id.toString());
    setDeleteModalOpen(true);
  };

  const filteredStocks = stocks.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto mb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Stocks</h1>
          <p className="text-slate-500 mt-1">Manage your medicine kits and inventory.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create New Stock
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading inventory...</p>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No stocks found</h3>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">Start by creating a stock like "Home First Aid" or "Travel Kit".</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
          >
            <Plus className="w-5 h-5" />
            Create your first stock
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.map((stock) => (
            <div 
              key={stock.id}
              onClick={() => navigate(`/stock/${stock.id}`)}
              className="group bg-white border border-slate-100 p-6 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleDeleteClick(e, stock.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Package className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1">{stock.name}</h3>
              <p className="text-slate-500 font-medium">{stock.medicines?.length || 0} items stored</p>
              
              <div className="mt-8 flex items-center text-blue-600 font-bold text-sm gap-1 translate-x-[-4px] group-hover:translate-x-0 transition-transform">
                View Details
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB for mobile */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed right-6 bottom-24 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Create Stock Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="New Medicine Stock"
      >
        <form onSubmit={handleCreateStock} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Name</label>
            <input 
              required
              type="text"
              placeholder="e.g., Bathroom Cabinet, Work Desk"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={newStockName}
              onChange={(e) => setNewStockName(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={actionLoading}
            className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {actionLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            Create Stock
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Stock?"
      >
        <div className="space-y-6">
          <p className="text-slate-600">
            Are you sure you want to delete this stock? All medicines inside will be permanently removed. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-200"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
