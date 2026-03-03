import { type FC } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../Modal';

interface DeleteMedicineModalProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; loading: boolean; }

const DeleteMedicineModal: FC<DeleteMedicineModalProps> = ({ isOpen, onClose, onConfirm, loading }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Remove Medicine?"
      footer={
        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
          <button onClick={onClose} disabled={loading} className="modal-action-btn modal-btn-cancel">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="modal-action-btn modal-btn-danger">
            {loading ? <><Loader2 className="animate-spin" size={20} /> Removing...</> : 'Yes, Remove'}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <p className="modal-text-muted">Are you sure you want to remove this medicine from your schedule? This action cannot be undone.</p>
      </div>
    </Modal>
  );
};

export default DeleteMedicineModal;
