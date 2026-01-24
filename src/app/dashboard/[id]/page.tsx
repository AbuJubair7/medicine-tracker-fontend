'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';

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
}

export default function StockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15, params is a Promise. We need to unwrap it using `use` or await.
  // Ideally, use `use()` hook if using React 19 features or await in async component.
  // But `use` hook is still experimental in some versions.
  // Standard way in Client Component is `use` or assume `params` is available if not async?
  // Wait, in Next.js 13+ App router:
  // Server Component: props.params is object.
  // Next 15: props.params is Promise.
  // "create-next-app@latest" installs latest Next.
  // I will use `use` from `react` as per latest docs, or simpler `await` if server component.
  // But this is 'use client'.
  // I'll try to unwrap it with `use` or useEffect.
  
  // Safe approach for 'use client':
  const [stockId, setStockId] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setStockId(p.id));
  }, [params]);

  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Form State
  const [medForm, setMedForm] = useState({
    name: '',
    dose: '',
    quantity: '',
    takeMorning: false,
    takeAfternoon: false,
    takeEvening: false
  });

  const fetchStock = async (id: string) => {
    try {
      const response = await api.get(`/stock/get/${id}`);
      setStock(response.data);
    } catch (err) {
      setError('Failed to load stock details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stockId) fetchStock(stockId);
  }, [stockId]);

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockId) return;
    
    try {
      await api.post(`/stock/insertMedicine/${stockId}`, {
        ...medForm,
        dose: Number(medForm.dose),
        quantity: Number(medForm.quantity)
      });
      // Refresh
      fetchStock(stockId);
      setIsModalOpen(false);
      setMedForm({ name: '', dose: '', quantity: '', takeMorning: false, takeAfternoon: false, takeEvening: false });
    } catch (err) {
      alert('Failed to add medicine');
    }
  };

  const handleDeleteMedicine = async (medId: number) => {
    if (!confirm('Delete this medicine?')) return;
    try {
      await api.delete(`/stock/medicine/${medId}`);
      if (stockId) fetchStock(stockId);
    } catch (err) {
      alert('Failed to delete medicine');
    }
  };
  
  const handleDeleteStock = async () => {
      if (!confirm('Delete this entire stock?')) return;
      try {
          if (!stockId) return;
          await api.delete(`/stock/${stockId}`);
          router.push('/dashboard');
      } catch (err) {
          alert('Failed to delete stock');
      }
  }

  if (loading || !stockId) return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>Loading details...</div>;
  if (error) return <div style={{ color: '#fca5a5', textAlign: 'center', marginTop: '2rem' }}>{error}</div>;
  if (!stock) return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>Stock not found</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/dashboard" className="glass-button" style={{ padding: '8px 12px', background: 'transparent', border: '1px solid var(--glass-border)' }}>
          ← Back
        </Link>
        <h2 style={{ fontSize: '2rem', flex: 1 }}>{stock.name}</h2>
        <button onClick={handleDeleteStock} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            Delete Stock
        </button>
      </div>

      {stock.medicines.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '1rem' }}>No medicines in this stock yet.</p>
          <button className="glass-button" onClick={() => setIsModalOpen(true)}>Add First Medicine</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {stock.medicines.map((med) => (
            <div key={med.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-secondary)' }}>{med.name}</h3>
                <button 
                  onClick={() => handleDeleteMedicine(med.id)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Dose:</span> {med.dose}mg
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Qty:</span> {med.quantity}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {med.takeMorning && <span style={pillStyle}>Morning</span>}
                {med.takeAfternoon && <span style={pillStyle}>Afternoon</span>}
                {med.takeEvening && <span style={pillStyle}>Evening</span>}
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="glass-panel"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '200px', 
              cursor: 'pointer',
              border: '2px dashed var(--glass-border)',
              background: 'transparent'
            }}
          >
            <span style={{ fontSize: '3rem', color: 'var(--text-secondary)' }}>+</span>
            <span style={{ color: 'var(--text-secondary)' }}>Add Medicine</span>
          </button>
        </div>
      )}

      {/* Add Medicine Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }} onClick={() => setIsModalOpen(false)}>
          <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Add Medicine</h3>
            <form onSubmit={handleAddMedicine} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                placeholder="Medicine Name" 
                className="glass-input" 
                value={medForm.name} 
                onChange={e => setMedForm({...medForm, name: e.target.value})} 
                required 
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input 
                  type="number" 
                  placeholder="Dose (mg)" 
                  className="glass-input" 
                  value={medForm.dose} 
                  onChange={e => setMedForm({...medForm, dose: e.target.value})} 
                  required 
                />
                <input 
                  type="number" 
                  placeholder="Quantity" 
                  className="glass-input" 
                  value={medForm.quantity} 
                  onChange={e => setMedForm({...medForm, quantity: e.target.value})} 
                  required 
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <label style={checkboxLabelStyle}>
                  <input type="checkbox" checked={medForm.takeMorning} onChange={e => setMedForm({...medForm, takeMorning: e.target.checked})} />
                  Morning
                </label>
                <label style={checkboxLabelStyle}>
                  <input type="checkbox" checked={medForm.takeAfternoon} onChange={e => setMedForm({...medForm, takeAfternoon: e.target.checked})} />
                  Afternoon
                </label>
                <label style={checkboxLabelStyle}>
                  <input type="checkbox" checked={medForm.takeEvening} onChange={e => setMedForm({...medForm, takeEvening: e.target.checked})} />
                  Evening
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>Cancel</button>
                <button type="submit" className="glass-button">Add Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const pillStyle = {
  background: 'rgba(6, 182, 212, 0.2)',
  color: '#22d3ee',
  padding: '4px 10px',
  borderRadius: '20px',
  fontSize: '0.8rem',
  border: '1px solid rgba(6, 182, 212, 0.3)'
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--text-secondary)',
  cursor: 'pointer'
};
