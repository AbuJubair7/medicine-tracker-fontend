
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Pill, LayoutDashboard, Settings, Bell } from 'lucide-react';

const Layout: React.FC = () => {
  const { logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Outlet />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <Pill className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">MedTrack<span className="text-blue-600">Pro</span></span>
        </div>

        <nav className="flex-1 space-y-1">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all font-medium group">
            <LayoutDashboard className="w-5 h-5 transition-transform group-hover:scale-110" />
            Dashboard
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 cursor-not-allowed font-medium">
            <Bell className="w-5 h-5" />
            Reminders
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 cursor-not-allowed font-medium">
            <Settings className="w-5 h-5" />
            Settings
          </div>
        </nav>

        <button 
          onClick={logout}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium border border-transparent hover:border-red-100"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </aside>

      {/* Mobile Top Nav */}
      <header className="md:hidden glass-effect sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Pill className="text-blue-600 w-6 h-6" />
          <span className="font-bold text-lg text-slate-800">MedTrack</span>
        </div>
        <button onClick={logout} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden glass-effect border-t border-slate-200 fixed bottom-0 left-0 right-0 py-3 px-6 flex justify-around items-center z-50">
        <Link to="/dashboard" className="p-2 text-blue-600 flex flex-col items-center">
          <LayoutDashboard className="w-6 h-6" />
        </Link>
        <button className="p-2 text-slate-400 flex flex-col items-center" disabled>
          <Bell className="w-6 h-6" />
        </button>
        <button className="p-2 text-slate-400 flex flex-col items-center" disabled>
          <Settings className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
};

export default Layout;
