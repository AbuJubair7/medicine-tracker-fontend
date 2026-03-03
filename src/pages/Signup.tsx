
import { useState, type FC, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '@/services/authService';
import { User, Mail, Lock, Loader2, ArrowRight, SunMedium, Moon } from 'lucide-react';
import './Login.css'; // Reusing auth shared styles

const Signup: FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await authService.signup(name, email, password);
      login(token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="theme-toggle btn-icon glass-card"
        aria-label="Toggle Theme"
      >
        {isDark ? <SunMedium size={20} color="#fbbf24" /> : <Moon size={20} color="#475569" />}
      </button>

      {/* Ambient glow orbs */}
      {isDark && (
        <>
          <div className="ambient-glow-blue" style={{ left: '-10%', top: '-20%', right: 'auto', bottom: 'auto' }} />
          <div className="ambient-glow-cyan" style={{ right: '-10%', bottom: '-20%', left: 'auto', top: 'auto', background: 'rgba(139, 92, 246, 0.1)' }} />
        </>
      )}

      <div className="login-content animate-slide-up delay-100">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <img src="/favicon.svg" alt="Dosely Logo" className="login-logo" />
          </div>
          <h1 className="login-title text-gradient">Join Dosely</h1>
          <p className="login-subtitle">Start tracking your health journey today.</p>
        </div>

        <div className="glass-card login-card" style={{ boxShadow: 'var(--shadow-lg), 0 0 20px rgba(139, 92, 246, 0.15)' }}>
          {error && (
            <div className="alert-error">
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="label-base">Full Name</label>
              <div className="input-icon-wrapper">
                <User className="input-icon" size={18} />
                <input required type="text"
                  className="input-base input-with-icon"
                  placeholder="John Doe" 
                  value={name} onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="label-base">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail className="input-icon" size={18} />
                <input required type="email"
                  className="input-base input-with-icon"
                  placeholder="name@example.com" 
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="label-base">Password</label>
              <div className="input-icon-wrapper">
                <Lock className="input-icon" size={18} />
                <input required type="password"
                  className="input-base input-with-icon"
                  placeholder="Create a password" 
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <button 
              type="submit" disabled={loading}
              className="btn btn-primary submit-btn"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>

        <p className="signup-prompt">
          Already have an account? <Link to="/login" className="signup-link" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
