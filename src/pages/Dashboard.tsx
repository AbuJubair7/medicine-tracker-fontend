
import { useEffect, useState, type FC, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Loader2, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { stockService } from '@/services/stockService';
import { Stock } from '@/types';
import StockCardItem from '@/components/StockCardItem';
import CreateStockModal from '@/components/modals/CreateStockModal';
import DeleteStockModal from '@/components/modals/DeleteStockModal';
import './Dashboard.css';

const Dashboard: FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();

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
      if (isReset) setLoading(true); else setIsFetchingMore(true);
      const { data, total } = await stockService.getAll(pageNum, 10);
      setStocks(prev => {
        if (isReset) return data;
        return [...prev, ...data.filter(d => !prev.some(p => p.id === d.id))];
      });
      setHasMore(data.length > 0 && (isReset ? data.length : stocks.length + data.length) < total);
    } catch (err) {
      console.error('Failed to fetch stocks', err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => { fetchStocks(1, true); }, []);
  useEffect(() => { if (page > 1) fetchStocks(page, false); }, [page]);

  const handleCreateStock = async (name: string) => {
    try {
      setActionLoading(true);
      const newStock = await stockService.create(name);
      setStocks(prev => [newStock, ...prev]);
      setIsModalOpen(false);
    } catch (err) { console.error('Failed to create stock', err); }
    finally { setActionLoading(false); }
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const confirmDelete = async () => {
    if (!stockToDelete) return;
    try {
      setDeleteLoading(true);
      await stockService.delete(stockToDelete);
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

  const filteredStocks = stocks.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1 className="dashboard-title text-gradient">Your Stocks</h1>
          <p className="dashboard-subtitle">Manage your medicine kits and inventory.</p>
        </div>
        
        <div className="dashboard-actions">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" placeholder="Search stocks..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base search-input"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary create-btn hidden md:flex"
          >
            <Plus size={20} /> Create New Stock
          </button>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading">
          <Loader2 size={40} color="var(--primary)" className="animate-spin" />
          <p className="loading-text">Loading inventory...</p>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="glass-card dashboard-empty">
          <div className="empty-icon-wrapper">
            <Package size={36} color="var(--text-muted)" />
          </div>
          <h3 className="empty-title">No stocks found</h3>
          <p className="empty-desc">Start by creating a stock like "Home First Aid" or "Travel Kit".</p>
          <button onClick={() => setIsModalOpen(true)} className="empty-action">
            <Plus size={20} /> Create your first stock
          </button>
        </div>
      ) : (
        <div className="dashboard-grid">
          {filteredStocks.map((stock, index) => (
            <StockCardItem
              key={stock.id}
              ref={filteredStocks.length === index + 1 ? lastStockElementRef : undefined}
              stock={stock}
              onClick={() => navigate(`/stock/${stock.id}`)}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>
      )}
      
      {isFetchingMore && (
        <div className="loading-more">
          <Loader2 size={24} color="var(--primary)" className="animate-spin" />
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="mobile-fab btn-primary"
        aria-label="Create New Stock"
      >
        <Plus size={28} />
      </button>

      <CreateStockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateStock} loading={actionLoading} />
      <DeleteStockModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} loading={deleteLoading} />
    </div>
  );
};

export default Dashboard;
