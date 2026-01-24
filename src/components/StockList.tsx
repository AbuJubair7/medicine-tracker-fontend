'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import StockCard from './StockCard';
import StockDetailsModal from './StockDetailsModal';

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

export default function StockList() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  
  // Create/Edit Stock state
  const [isCreating, setIsCreating] = useState(false);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [stockName, setStockName] = useState('');

  const fetchStocks = async () => {
    try {
      const response = await api.get('/stock/getAll');
      setStocks(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load stocks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStockId) {
        await api.patch(`/stock/${editingStockId}`, { name: stockName });
      } else {
        await api.post('/stock/create', { name: stockName });
      }
      setStockName('');
      setIsCreating(false);
      setEditingStockId(null);
      fetchStocks();
    } catch (err) {
      alert('Failed to save stock');
    }
  };

  const handleDeleteStock = async (id: number) => {
    if (!confirm('Are you sure you want to delete this stock? All medicines inside will be lost.')) return;
    try {
      await api.delete(`/stock/${id}`);
      fetchStocks();
    } catch (err) {
      alert('Failed to delete stock');
    }
  };

  const openStock = async (stock: Stock) => {
     // Fetch fresh details including medicines?
     // The getAll might not return medicines array populated deeply or correctly if not configured.
     // Let's verify by fetching individual stock if needed, or rely on getAll if it populates.
     // Based on typical TypeORM find(), relations might need to be set.
     // Assuming getAll DOES NOT load relations for performance, let's fetch detail.
     try {
       const res = await api.get(`/stock/get/${stock.id}`);
       setSelectedStock(res.data);
     } catch (e) {
       console.error("Could not fetch details", e);
     }
  };

  const handleCloseModal = () => {
    setSelectedStock(null);
    fetchStocks(); // Refresh numbers
  };

  const startEditStock = (stock: Stock) => {
    setStockName(stock.name);
    setEditingStockId(stock.id);
    setIsCreating(true);
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)'}}>Loading stocks...</div>;

  const totalStocks = stocks.length;
  // Calculate total medicines just for fun or stats? Optional.
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>My Stocks</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Total: {totalStocks} {totalStocks === 1 ? 'List' : 'Lists'}</p>
        </div>
        <button 
          className="glass-button"
          onClick={() => { setIsCreating(true); setEditingStockId(null); setStockName(''); }}
        >
          + New Stock
        </button>
      </div>

      {isCreating && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '12px',
          maxWidth: '500px'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>{editingStockId ? 'Edit Stock Name' : 'Create New Stock'}</h3>
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              className="glass-input"
              value={stockName}
              onChange={e => setStockName(e.target.value)}
              placeholder="e.g. Grandma's Meds, Emergency Kit..."
              required
              autoFocus
              style={{ flex: 1 }}
            />
            <button type="submit" className="glass-button">Save</button>
            <button 
              type="button" 
              onClick={() => { setIsCreating(false); setEditingStockId(null); }}
              style={{ 
                background: 'transparent',
                border: '1px solid var(--text-secondary)',
                color: 'var(--text-secondary)',
                padding: '0 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {stocks.length === 0 && !isCreating ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          background: 'rgba(255,255,255,0.02)', 
          borderRadius: '16px',
          border: '2px dashed rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>No stocks found</h3>
          <button 
            className="glass-button"
            onClick={() => setIsCreating(true)}
          >
            Create your first Stock
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {stocks.map(stock => (
            <StockCard 
              key={stock.id}
              id={stock.id}
              name={stock.name}
              medicineCount={stock.medicines?.length || 0}
              onOpen={() => openStock(stock)}
              onEdit={() => startEditStock(stock)}
              onDelete={() => handleDeleteStock(stock.id)}
            />
          ))}
        </div>
      )}

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
