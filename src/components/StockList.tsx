'use client';

import { useEffect, useState, useRef, Component, type ReactNode, type FormEvent, Fragment } from 'react';
import api from '@/services/api';
import StockCard from './StockCard';
import StockDetailsModal from './StockDetailsModal';
import LoadingSpinner from './LoadingSpinner';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  state = { hasError: false, error: null };
  readonly props!: { children: ReactNode };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', border: '1px solid red', margin: '2rem' }}>
          <h2>Something went wrong in StockList.</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

interface Medicine {
  id: number;
  name: string;
  dose: number;
  quantity: number;
  takeMorning: boolean;
  takeAfternoon: boolean;
  takeEvening: boolean;
}

interface Stock {
  id: number;
  name: string;
  medicines: Medicine[];
  createdAt: string;
}

function StockListContent() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const LIMIT = 10;

  // Modal & Edit State
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [stockName, setStockName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStocks = async (pageNum: number, isReset = false) => {
    try {
      if (isReset) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const response = await api.get('/stock/getAll', {
        params: { page: pageNum, limit: LIMIT },
      });

      console.log('API Fetch Result:', response.data);

      const responseData = response.data;
      let newStocks = responseData?.data;
      const total = responseData?.total || 0;

      // STRICT VALIDATION
      if (!Array.isArray(newStocks)) {
        console.warn('Expected array for newStocks but got:', newStocks);
        if (Array.isArray(responseData)) {
            newStocks = responseData; // Old Backend Format Fallback
        } else {
            newStocks = [];
        }
      }

      if (isReset) {
        setStocks(newStocks);
      } else {
        setStocks((prev) => {
            // Safety Check for prev
            if (!Array.isArray(prev)) return newStocks;
            const existingIds = new Set(prev.map((s) => s.id));
            const filtered = newStocks.filter((s: Stock) => s && !existingIds.has(s.id));
            return [...prev, ...filtered];
        });
      }

      // Check if we reached the end
      if (isReset) {
         setHasMore(newStocks.length < total && newStocks.length >= LIMIT);
      } else {
         setHasMore((stocks.length + newStocks.length) < total);
      }
      
      setError('');
    } catch (err: any) {
      console.error("Fetch Stocks Error:", err);
      setError('Failed to load stocks.');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchStocks(1, true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !loading) {
            setPage((prev) => {
            const nextPage = prev + 1;
            fetchStocks(nextPage, false);
            return nextPage;
          });
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isFetchingMore, loading]);


  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStockId) {
        await api.patch(`/stock/${editingStockId}`, { name: stockName });
      } else {
        await api.post('/stock/create', { name: stockName });
      }
      setStockName('');
      setIsCreating(false);
      setEditingStockId(null);
      setPage(1);
      setHasMore(true);
      fetchStocks(1, true);
    } catch (err) {
      alert('Failed to save stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStock = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/stock/${id}`);
      setStocks((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert('Failed to delete stock');
    }
  };

  const openStock = async (stock: Stock) => {
     try {
       const res = await api.get(`/stock/${stock.id}`);
       setSelectedStock(res.data);
     } catch (e: any) {
       alert(`Failed to load stock: ${e.message}`);
     }
  };

  const handleCloseModal = () => {
    setSelectedStock(null);
  };

  const startEditStock = (stock: Stock) => {
    setStockName(stock.name);
    setEditingStockId(stock.id);
    setIsCreating(true);
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalStocks = Array.isArray(stocks) ? stocks.length : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>My Stocks</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Showing: {totalStocks} Lists</p>
        </div>
        <button 
          className="glass-button"
          onClick={() => { setIsCreating(true); setEditingStockId(null); setStockName(''); }}
        >
          + New Stock
        </button>
      </div>

      {isCreating && (
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', marginBottom: '2rem', borderRadius: '12px' }}>
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              className="glass-input"
              value={stockName}
              onChange={e => setStockName(e.target.value)}
              placeholder="Stock name..."
              required
              style={{ flex: 1 }}
            />
            <button type="submit" className="glass-button">Save</button>
            <button type="button" onClick={() => setIsCreating(false)} className="glass-button" style={{ background: 'transparent', border: '1px solid gray' }}>Cancel</button>
          </form>
        </div>
      )}

      {totalStocks === 0 && !loading && !isCreating ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>No stocks found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {Array.isArray(stocks) && stocks.filter(s => s && s.id).map(stock => (
            <Fragment key={stock.id}>
              <StockCard 
                id={stock.id}
                name={stock.name}
                medicineCount={stock.medicines?.length || 0}
                onOpen={() => openStock(stock)}
                onEdit={() => startEditStock(stock)}
                onDelete={() => handleDeleteStock(stock.id)}
              />
            </Fragment>
          ))}
        </div>
      )}

      <div ref={observerTarget} style={{ height: '20px', margin: '20px 0', textAlign: 'center' }}>
        {isFetchingMore && <LoadingSpinner size="sm" />}
      </div>

      {selectedStock && (
        <StockDetailsModal 
          stockId={selectedStock.id}
          stockName={selectedStock.name}
          medicines={selectedStock.medicines || []}
          onClose={handleCloseModal}
          onUpdate={() => openStock(selectedStock)}
        />
      )}
    </div>
  );
}

// Export the Wrapped Component
export default function StockList() {
  return (
    <ErrorBoundary>
      <StockListContent />
    </ErrorBoundary>
  );
}
