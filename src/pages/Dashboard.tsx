
import { useEffect, useState, type FC } from 'react';
import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Loader2, Search } from 'lucide-react';
import { stockService } from '@/services/stockService';
import { Stock } from '@/types';
import StockCardItem from '@/components/StockCardItem';
import CreateStockModal from '@/components/modals/CreateStockModal';
import DeleteStockModal from '@/components/modals/DeleteStockModal';

const Dashboard: FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // removed newStockName state
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  
  const navigate = useNavigate();

  const lastStockElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, isFetchingMore, hasMore]);

  const fetchStocks = async (pageNum: number, isReset: boolean = false) => {
    try {
      if (isReset) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const { data, total } = await stockService.getAll(pageNum, 10);
      
      setStocks(prev => {
        if (isReset) return data;
        // Avoid duplicates if strict mode double-invokes
        const newIds = new Set(data.map(d => d.id));
        return [...prev, ...data.filter(d => !prev.some(p => p.id === d.id))];
      });

      setHasMore(data.length > 0 && (isReset ? data.length : stocks.length + data.length) < total );
    } catch (err) {
      console.error('Failed to fetch stocks', err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchStocks(1, true);
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchStocks(page, false);
    }
  }, [page]);

  const handleCreateStock = async (name: string) => {
    try {
      setActionLoading(true);
      const newStock = await stockService.create(name);
      setStocks(prev => [newStock, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create stock', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const confirmDelete = async () => {
    if (!stockToDelete) return;
    
    try {
      setDeleteLoading(true);
      await stockService.delete(stockToDelete);
      
      // Update UI after success
      setStocks(prev => prev.filter(s => s.id !== parseInt(stockToDelete)));
      setDeleteModalOpen(false);
      setIsModalOpen(false); 
    } catch (err) {
      console.error('Failed to delete stock', err);
      alert('Failed to delete stock');
    } finally {
      setDeleteLoading(false);
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
          {filteredStocks.map((stock, index) => {
            const isLast = filteredStocks.length === index + 1;
            return (
              <StockCardItem
                key={stock.id}
                ref={isLast ? lastStockElementRef : undefined}
                stock={stock}
                onClick={() => navigate(`/stock/${stock.id}`)}
                onDeleteClick={handleDeleteClick}
              />
            );
          })}
        </div>
      )}
      
      {isFetchingMore && (
         <div className="flex justify-center py-4">
           <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
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
      <CreateStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStock}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteStockModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Dashboard;
