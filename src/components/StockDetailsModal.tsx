import React, { useState } from 'react';
import api from '@/services/api';
import LoadingSpinner from './LoadingSpinner';

interface Medicine {
  id: number;
  name: string;
  dose: number;
  quantity: number;
  takeMorning: boolean;
  takeAfternoon: boolean;
  takeEvening: boolean;
}

interface StockDetailsModalProps {
  stockId: number;
  stockName: string;
  medicines: Medicine[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function StockDetailsModal({ stockId, stockName, medicines, onClose, onUpdate }: StockDetailsModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dose: '' as number | string,
    quantity: '' as number | string,
    takeMorning: false,
    takeAfternoon: false,
    takeEvening: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      dose: '',
      quantity: '',
      takeMorning: false,
      takeAfternoon: false,
      takeEvening: false
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Ensure numeric values are numbers
      const payload = {
        ...formData,
        dose: Number(formData.dose) || 0,
        quantity: Number(formData.quantity) || 0
      };
      await api.post(`/stock/insertMedicine/${stockId}`, payload);
      onUpdate();
      resetForm();
    } catch (error) {
      console.error('Failed to add medicine:', error);
      alert('Failed to add medicine');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        dose: Number(formData.dose) || 0,
        quantity: Number(formData.quantity) || 0
      };
      await api.patch(`/stock/medicine/${editingId}`, payload);
      onUpdate();
      resetForm();
    } catch (error) {
      console.error('Failed to update medicine:', error);
      alert('Failed to update medicine');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await api.delete(`/stock/medicine/${id}`);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete medicine:', error);
      alert('Failed to delete medicine');
    }
  };

  const startEdit = (med: Medicine) => {
    setEditingId(med.id);
    setFormData({
      name: med.name,
      dose: med.dose,
      quantity: med.quantity,
      takeMorning: med.takeMorning,
      takeAfternoon: med.takeAfternoon,
      takeEvening: med.takeEvening
    });
    setIsAdding(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }} onClick={onClose}>
      <div 
        className="glass-panel"
        style={{
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          backgroundColor: '#1e1b4b', // Deep indigo background fallback
        }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          &times;
        </button>

        <h2 style={{ 
          fontSize: '2rem', 
          marginBottom: '1.5rem', 
          color: 'var(--accent-secondary)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '1rem'
        }}>
          {stockName} <span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>Medicines</span>
        </h2>

        {!isAdding && !editingId && (
          <button 
            className="glass-button"
            onClick={() => setIsAdding(true)}
            style={{ marginBottom: '1.5rem' }}
          >
            + Add Medicine
          </button>
        )}

        {(isAdding || editingId) && (
          <form onSubmit={editingId ? handleEditSubmit : handleAddSubmit} style={{ 
            marginBottom: '2rem', 
            padding: '1.5rem', 
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '12px',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
          }}>
            <h3 style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
              {editingId ? 'Edit Medicine' : 'Add New Medicine'}
            </h3>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Name</label>
              <input 
                className="glass-input" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Dose (mg)</label>
              <input 
                type="number"
                className="glass-input" 
                value={formData.dose} 
                onChange={e => setFormData({...formData, dose: e.target.value === '' ? '' : Number(e.target.value)})} 
                required 
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Quantity</label>
              <input 
                type="number"
                className="glass-input" 
                value={formData.quantity} 
                onChange={e => setFormData({...formData, quantity: e.target.value === '' ? '' : Number(e.target.value)})} 
                required 
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={formData.takeMorning}
                  onChange={e => setFormData({...formData, takeMorning: e.target.checked})}
                />
                Morning
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={formData.takeAfternoon}
                  onChange={e => setFormData({...formData, takeAfternoon: e.target.checked})}
                />
                Afternoon
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={formData.takeEvening}
                  onChange={e => setFormData({...formData, takeEvening: e.target.checked})}
                />
                Evening
              </label>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="glass-button" 
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? <LoadingSpinner size="sm" color="border-white" /> : 'Save'}
              </button>
              <button type="button" onClick={resetForm} disabled={submitting} style={{ 
                background: 'transparent', 
                border: '1px solid var(--text-secondary)', 
                color: 'var(--text-secondary)',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                opacity: submitting ? 0.5 : 1
              }}>Cancel</button>
            </div>
          </form>
        )}

        <div style={{ display: 'grid', gap: '1rem' }}>
          {medicines && medicines.length > 0 ? (
            medicines.map(med => (
              <div key={med.id} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{med.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {med.dose}mg • Qty: {med.quantity}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    {med.takeMorning && <span style={tagStyle}>Morning</span>}
                    {med.takeAfternoon && <span style={tagStyle}>Afternoon</span>}
                    {med.takeEvening && <span style={tagStyle}>Evening</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => startEdit(med)} style={actionButtonStyle}>✎</button>
                  <button onClick={() => handleDelete(med.id)} style={{...actionButtonStyle, color: '#fca5a5'}}>🗑</button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No medicines in this stock yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const tagStyle = {
  background: 'rgba(99, 102, 241, 0.2)',
  color: '#a5b4fc',
  padding: '0.2rem 0.6rem',
  borderRadius: '100px',
};

const actionButtonStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: 'none',
  color: 'var(--text-secondary)',
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
};
