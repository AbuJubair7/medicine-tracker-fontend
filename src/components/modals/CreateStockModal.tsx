import { useState, type FormEvent, type FC } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../Modal';

interface CreateStockModalProps { isOpen: boolean; onClose: () => void; onSubmit: (name: string) => Promise<void>; loading: boolean; }

const CreateStockModal: FC<CreateStockModalProps> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [stockName, setStockName] = useState('');
  const handleSubmit = async (e: FormEvent) => { e.preventDefault(); if (!stockName.trim()) return; await onSubmit(stockName); setStockName(''); };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="New Medicine Stock"
      footer={
        <button type="submit" form="create-stock-form" disabled={loading} className="modal-action-btn" style={{ background: 'var(--primary)', color: 'white', border: 'none', margin: 0, width: '100%' }}>
          {loading ? <><Loader2 size={20} className="animate-spin" /> Creating...</> : 'Create Stock'}
        </button>
      }
    >
      <form id="create-stock-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="modal-form-group" style={{ marginBottom: 0 }}>
          <label className="modal-form-label">Stock Name</label>
          <input required type="text" placeholder="e.g., Bathroom Cabinet, Work Desk" className="modal-form-input" value={stockName} onChange={(e) => setStockName(e.target.value)} />
        </div>
      </form>
    </Modal>
  );
};

export default CreateStockModal;
