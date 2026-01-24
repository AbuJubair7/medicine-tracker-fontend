import React from 'react';

interface StockCardProps {
  id: number;
  name: string;
  medicineCount: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function StockCard({ id, name, medicineCount, onOpen, onEdit, onDelete }: StockCardProps) {
  return (
    <div 
      className="glass-panel"
      onClick={onOpen}
      style={{
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        minHeight: '150px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {name}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          {medicineCount} {medicineCount === 1 ? 'Medicine' : 'Medicines'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }} onClick={e => e.stopPropagation()}>
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          style={cardButtonStyle}
          title="Edit Name"
        >
          ✎
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ ...cardButtonStyle, color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          title="Delete Stock"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

const cardButtonStyle = {
  background: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'var(--text-secondary)',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease'
};
