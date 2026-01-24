'use client';

import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
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
      <button 
        onClick={handleLogout}
        className="glass-button"
        style={{ 
          padding: '8px 16px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: 'none'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
      >
        Logout
      </button>
    </nav>
  );
}
