
import { useState, type FC, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '@/services/authService';
import { Mail, Lock, Loader2, ArrowRight, AlertTriangle, SunMedium, Moon } from 'lucide-react';
import './Login.css';

const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await authService.login(email, password);
      login(token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const { token } = await authService.googleLogin(credentialResponse.credential);
      login(token);
    } catch (err: any) {
      console.error('Google Auth Backend Error:', err);
      setError('Google login worked, but the server rejected it. Backend might be down.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('auth_origin_mismatch');
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
          <div className="ambient-glow-cyan" />
          <div className="ambient-glow-blue" />
        </>
      )}

      <div className="login-content animate-slide-up">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <img src="/favicon.svg" alt="Dosely Logo" className="login-logo" />
          </div>
          <h1 className="login-title text-gradient">Dosely</h1>
          <p className="login-subtitle">Sign in to manage your medication inventory.</p>
        </div>

        <div className="glass-card login-card">
          {error === 'auth_origin_mismatch' && (
            <div className="alert-error">
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Google Auth Blocked</div>
                <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '8px' }}>
                  This environment's domain is not authorized in your Google Cloud Project.
                </p>
                <button onClick={() => setError(null)} className="btn btn-secondary" style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}>
                  Try Again
                </button>
              </div>
            </div>
          )}

          {error && error !== 'auth_origin_mismatch' && (
            <div className="alert-error">
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="label-base">Email</label>
              <div className="input-icon-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  required type="email"
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
                <input 
                  required type="password"
                  className="input-base input-with-icon"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <button 
              type="submit" disabled={loading}
              className="btn btn-primary submit-btn"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="divider-container">
            <div className="divider-line"></div>
            <span className="divider-text">or continue with</span>
          </div>

          <div className="google-btn-wrapper">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} onError={handleGoogleError} 
              theme={isDark ? "filled_black" : "outline"}
              shape="pill" size="large" width="100%"
              use_fedcm_for_prompt={true}
            />
          </div>
        </div>

        <p className="signup-prompt">
          New here? <Link to="/signup" className="signup-link">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
