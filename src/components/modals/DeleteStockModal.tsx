import { type FC } from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../Modal';

interface DeleteStockModalProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; loading: boolean; }

const DeleteStockModal: FC<DeleteStockModalProps> = ({ isOpen, onClose, onConfirm, loading }) => {
  const { isDark } = useTheme();
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Delete Stock?"
      footer={
        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
          <button onClick={onClose} disabled={loading} className="modal-action-btn modal-btn-cancel">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="modal-action-btn modal-btn-danger">
            {loading ? <><Loader2 className="animate-spin" size={20} /> Deleting...</> : 'Yes, Delete'}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <p className="modal-text-muted">Are you sure you want to delete this stock? All medicines inside will be permanently removed. This action cannot be undone.</p>
      </div>
    </Modal>
  );
};

export default DeleteStockModal;
