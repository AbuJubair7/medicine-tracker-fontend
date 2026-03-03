import { forwardRef } from 'react';
import { Trash2, ArrowRight, Pill } from 'lucide-react';
import { Stock } from '@/types';
import './StockCardItem.css';

interface StockCardItemProps {
  stock: Stock;
  onDeleteClick: (e: React.MouseEvent, id: number) => void;
  onClick: () => void;
}

const StockCardItem = forwardRef<HTMLDivElement, StockCardItemProps>(({ stock, onDeleteClick, onClick }, ref) => {
  return (
    <div 
      ref={ref}
      onClick={onClick}
      className="glass-card stock-card"
    >
      <div className="stock-card-delete-wrapper">
        <button 
          onClick={(e) => onDeleteClick(e, stock.id)}
          className="stock-card-delete-btn"
          aria-label="Delete Stock"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <div className="stock-card-header">
        <div className="stock-card-icon-wrapper">
          <Pill size={20} />
        </div>
        <span className="stock-card-count">
          {stock.medicineCount ?? stock.medicines?.length ?? 0} items stored
        </span>
      </div>
      
      <h3 className="stock-card-title">{stock.name}</h3>
      
      <div className="stock-card-footer">
        View Details
        <ArrowRight size={16} className="stock-card-footer-icon" />
      </div>
    </div>
  );
});

StockCardItem.displayName = 'StockCardItem';

export default StockCardItem;
