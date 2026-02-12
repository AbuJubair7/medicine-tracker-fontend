
import { useState, useEffect, type FC, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authService } from '@/services/authService';
import { Pill, Mail, Lock, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';

const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();



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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 animate-bounce-short">
            <img src="/favicon.svg" alt="Dosely Logo" className="w-32 h-32" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Dosely</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Sign in to manage your medication inventory.</p>
        </div>



        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          {error === 'auth_origin_mismatch' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Google Auth Blocked</span>
              </div>
              <p className="text-xs text-amber-800 mb-4 leading-relaxed">
                This environment's domain is not authorized in your Google Cloud Project.
              </p>
              <button 
                onClick={() => setError(null)}
                className="w-full py-2.5 bg-amber-600 text-white rounded-xl font-bold text-xs hover:bg-amber-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {error && error !== 'auth_origin_mismatch' && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-semibold border border-red-100 flex items-start gap-2 mb-6">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="email"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="password"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]"><span className="px-4 py-1 bg-white text-slate-400">or continue with</span></div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={handleGoogleError} 
              theme="outline"
              shape="pill"
              size="large"
              width="100%"
              use_fedcm_for_prompt={true}
            />
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 text-sm font-medium">
          New here? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Create an account</Link>
        </p>
      </div>
      
      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-short {
          animation: bounce-short 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
