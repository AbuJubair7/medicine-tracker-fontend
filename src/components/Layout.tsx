
import { type FC } from 'react';
import { Navigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, LayoutDashboard, Settings, Bell, SunMedium, Moon } from 'lucide-react';
import './Layout.css';

const Layout: FC = () => {
  const { logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  if (!isAuthenticated) return <Outlet />;

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="app-layout animate-fade-in">
      {/* Sidebar for Desktop */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-wrapper">
            <img src="/favicon.svg" alt="Logo" className="sidebar-logo" />
          </div>
          <span className="sidebar-brand text-gradient">Dosely</span>
        </div>

        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`nav-item ${isActive('/dashboard') || isActive('/stock') ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <div className="nav-item disabled">
            <Bell size={20} />
            Reminders
          </div>
          <div className="nav-item disabled">
            <Settings size={20} />
            Settings
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={toggleTheme} className="action-item">
            {isDark ? <SunMedium size={20} color="#fbbf24" /> : <Moon size={20} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={logout} className="action-item action-logout">
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <header className="mobile-top-nav">
        <div className="mobile-brand">
          <img src="/favicon.svg" alt="Dosely" className="mobile-logo" />
          <span className="mobile-title text-gradient">Dosely</span>
        </div>
        <div className="mobile-actions">
          <button onClick={toggleTheme} className="mobile-icon-btn">
            {isDark ? <SunMedium size={20} color="#fbbf24" /> : <Moon size={20} />}
          </button>
          <button onClick={logout} className="mobile-icon-btn mobile-icon-logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <Link to="/dashboard" className={`bottom-nav-item ${isActive('/dashboard') || isActive('/stock') ? 'active' : ''}`}>
          <LayoutDashboard size={24} />
        </Link>
        <button className="bottom-nav-item disabled" disabled>
          <Bell size={24} />
        </button>
        <button className="bottom-nav-item disabled" disabled>
          <Settings size={24} />
        </button>
      </nav>
    </div>
  );
};

export default Layout;
