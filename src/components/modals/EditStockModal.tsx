import { useState, useEffect, type FormEvent, type FC } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../Modal';

interface EditStockModalProps { isOpen: boolean; onClose: () => void; onSubmit: (name: string) => Promise<void>; loading: boolean; initialName: string; }

const EditStockModal: FC<EditStockModalProps> = ({ isOpen, onClose, onSubmit, loading, initialName }) => {
  const [stockName, setStockName] = useState(initialName);
  useEffect(() => { setStockName(initialName); }, [initialName, isOpen]);
  const handleSubmit = async (e: FormEvent) => { e.preventDefault(); if (!stockName.trim()) return; await onSubmit(stockName); };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Rename Stock"
      footer={
        <button type="submit" form="edit-stock-form" disabled={loading} className="modal-action-btn" style={{ background: 'var(--primary)', color: 'white', border: 'none', margin: 0, width: '100%' }}>
          {loading ? <><Loader2 size={20} className="animate-spin" /> Updating...</> : 'Update Name'}
        </button>
      }
    >
      <form id="edit-stock-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="modal-form-group" style={{ marginBottom: 0 }}>
          <label className="modal-form-label">Stock Name</label>
          <input required type="text" placeholder="e.g., Bathroom Cabinet" className="modal-form-input" value={stockName} onChange={(e) => setStockName(e.target.value)} />
        </div>
      </form>
    </Modal>
  );
};

export default EditStockModal;
