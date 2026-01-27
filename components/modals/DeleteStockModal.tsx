import React from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../Modal';

interface DeleteStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const DeleteStockModal: React.FC<DeleteStockModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Stock?"
    >
      <div className="space-y-6">
        <p className="text-slate-600">
          Are you sure you want to delete this stock? All medicines inside will be permanently removed. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Deleting...
              </>
            ) : (
              'Yes, Delete'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteStockModal;
