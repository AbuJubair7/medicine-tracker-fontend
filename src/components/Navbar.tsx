'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function Navbar() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    setLoading(true);
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  return (
    <nav className="glass-panel" style={{ 
      margin: '1rem', 
      padding: '1rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderRadius: '16px'
    }}>
      <h1 style={{ 
        background: 'linear-gradient(to right, #a78bfa, #22d3ee)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        Medicine Tracker
      </h1>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          onClick={toggleTheme}
          className="glass-button"
          style={{
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid var(--glass-border)',
            boxShadow: 'none',
            fontSize: '1.2rem'
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      <button 
        onClick={handleLogout}
        className="glass-button"
        disabled={loading}
        style={{ 
          padding: '8px 16px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: loading ? 0.7 : 1
        }}
        onMouseOver={(e) => !loading && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
        onMouseOut={(e) => !loading && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
      >
        {loading ? <LoadingSpinner size="sm" color="border-red-400" /> : 'Logout'}
      </button>
      </div>
    </nav>
  );
}
