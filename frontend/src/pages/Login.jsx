import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldAlert, Chrome, User, GraduationCap, Briefcase } from 'lucide-react';
import api from '../utils/api';

const Login = () => {
  const { loginWithGoogle, user, error: authError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [customError, setCustomError] = useState(null);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'auth_failed') {
      setCustomError('Google authentication failed. Please configure client keys in your .env configuration.');
    } else if (errorParam === 'no_token') {
      setCustomError('Redirection failed: No JWT token was issued by the backend.');
    }
  }, [searchParams]);

  const handleSignIn = () => {
    setLoading(true);
    setCustomError(null);
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#04050a] text-white">
      
      {/* Background Liquid Pastel Blobs */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] rounded-full bg-[#0a113a] opacity-60 blur-[130px] pointer-events-none animate-blob-1"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[65%] h-[65%] rounded-full bg-[#180a30] opacity-70 blur-[150px] pointer-events-none animate-blob-2"></div>
      <div className="absolute top-[30%] right-[15%] w-[45%] h-[45%] rounded-full bg-[#200f38] opacity-50 blur-[120px] pointer-events-none animate-blob-3"></div>

      <div className="max-w-md w-full z-10 p-2">
        <div className="glass-panel rounded-[32px] p-8 space-y-7 flex flex-col items-center">
          
          {/* Logo Widget */}
          <div className="flex flex-col items-center space-y-3 select-none text-center">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg shadow-black/30">
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#c084fc' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' className="w-7 h-7">
                <path d='m22 2-7 20-4-9-9-4Z' />
                <path d='M22 2 11 13' />
              </svg>
            </div>
            <div className="leading-tight">
              <h1 className="text-xl font-black text-white tracking-tight">MailMate</h1>
              <p className="text-[8.5px] text-purple-400 font-bold uppercase tracking-widest mt-1.5">AI Gmail Organizer</p>
            </div>
          </div>

          {/* Description */}
          <div className="text-center space-y-1.5">
            <h2 className="text-[13px] font-extrabold text-white/80">Access your Gmail inbox, unified.</h2>
            <p className="text-[11px] text-white/40 leading-relaxed max-w-[280px] mx-auto font-bold">
              Group incoming mails by sender, read full body content, and view Siri summaries in a premium glass interface.
            </p>
          </div>

          {/* Error alerts */}
          {(authError || customError) && (
            <div className="w-full p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-bold flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-450 mt-0.5" />
              <span className="leading-relaxed">{customError || authError}</span>
            </div>
          )}

          {/* Single Google Login Button */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3.5 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold transition-all shadow-sm hover:bg-white/10 select-none active:scale-[0.98] text-[11.5px]"
          >
            {loading ? (
              <div className="w-4.5 h-4.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : (
              <Chrome className="w-4.5 h-4.5 text-purple-400" />
            )}
            <span>{loading ? 'Connecting Google OAuth...' : 'Sign in with Google Account'}</span>
          </button>

  // Removed Demo Persona selection cards


          {/* Features check bullets */}
          <div className="w-full border-t border-white/5 pt-5 space-y-2 text-[10px] text-white/35 font-bold">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Dynamic Gmail sender grouping engine</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>MailMate AI 2-sentence summary generator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
