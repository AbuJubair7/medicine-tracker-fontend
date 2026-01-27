import React, { forwardRef } from 'react';
import { Package, Trash2, ArrowRight, Pill } from 'lucide-react';
import { Stock } from '../types';

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
      className="group bg-white border border-slate-100 p-6 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => onDeleteClick(e, stock.id)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-white/60 p-2 rounded-xl">
          <Pill className="w-5 h-5 text-blue-600" />
        </div>
        <span className="font-bold text-slate-700">
          {stock.medicineCount ?? stock.medicines?.length ?? 0} items stored
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-1">{stock.name}</h3>
      
      <div className="mt-8 flex items-center text-blue-600 font-bold text-sm gap-1 translate-x-[-4px] group-hover:translate-x-0 transition-transform">
        View Details
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
});

StockCardItem.displayName = 'StockCardItem';

export default StockCardItem;
