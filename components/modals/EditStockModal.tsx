import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../Modal';

interface EditStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  loading: boolean;
  initialName: string;
}

const EditStockModal: React.FC<EditStockModalProps> = ({ isOpen, onClose, onSubmit, loading, initialName }) => {
  const [stockName, setStockName] = useState(initialName);

  useEffect(() => {
    setStockName(initialName);
  }, [initialName, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockName.trim()) return;
    await onSubmit(stockName);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Rename Stock"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Name</label>
          <input 
            required
            type="text"
            placeholder="e.g., Bathroom Cabinet"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={stockName}
            onChange={(e) => setStockName(e.target.value)}
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          Update Name
        </button>
      </form>
    </Modal>
  );
};

export default EditStockModal;
