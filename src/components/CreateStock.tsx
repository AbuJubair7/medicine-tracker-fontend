'use client';

import { useState } from 'react';
import api from '@/services/api';

export default function CreateStock() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/stock/create', { name });
      setName('');
      setIsOpen(false);
      // Trigger update
      window.dispatchEvent(new Event('stockUpdated'));
    } catch (err) {
      alert('Failed to create stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="glass-button"
        style={{ 
          position: 'fixed', 
          bottom: '2rem', 
          right: '2rem', 
          borderRadius: '50%', 
          width: '60px', 
          height: '60px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '2rem',
          padding: 0
        }}
      >
        +
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }} onClick={() => setIsOpen(false)}>
          <div 
            className="glass-panel" 
            style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>New Stock</h3>
            <form onSubmit={handleSubmit}>
              <input
                autoFocus
                type="text"
                placeholder="Stock Name (e.g. Grandma's Meds)"
                className="glass-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginBottom: '1.5rem' }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="glass-button" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
