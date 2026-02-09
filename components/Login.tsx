
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isResetPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setSuccessMessage('Check your email for reset link.');
        setTimeout(() => setIsResetPassword(false), 3000);
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        setSuccessMessage('Success! Check your email to verify.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (isResetPassword) return 'Reset password';
    if (isSignUp) return 'Join Us';
    return 'Welcome back';
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-yellow-200/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-[380px] relative z-10">
        <div className="flex flex-col items-center mb-4 sm:mb-8">
          <div className="bg-primary size-9 sm:size-14 rounded-lg sm:rounded-2xl flex items-center justify-center text-slate-900 shadow-lg mb-2 sm:mb-4">
            <span className="material-symbols-outlined text-[20px] sm:text-[36px]">psychology</span>
          </div>
          <h1 className="text-base sm:text-2xl font-bold dark:text-white">Smart AI Notes</h1>
          <p className="text-slate-600 dark:text-zinc-400 text-[9px] sm:text-sm font-medium">Ideas at the speed of thought.</p>
        </div>

        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/40 dark:border-zinc-800/60 rounded-[20px] sm:rounded-[40px] p-5 sm:p-10 shadow-2xl">
          <h2 className="text-sm sm:text-xl font-bold mb-3 sm:mb-6 text-slate-900 dark:text-white">{getTitle()}</h2>
          
          {error && <div className="mb-3 p-2 bg-red-500/10 text-red-600 text-[9px] font-bold rounded-lg border border-red-500/20">{error}</div>}
          {successMessage && <div className="mb-3 p-2 bg-emerald-500/10 text-emerald-600 text-[9px] font-bold rounded-lg border border-emerald-500/20">{successMessage}</div>}

          <form className="space-y-2.5 sm:space-y-6" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[8px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 ml-1">Full Name</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] sm:text-[20px]">person</span>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                    className="w-full bg-white/60 dark:bg-zinc-800/60 border border-white/20 dark:border-zinc-700/50 rounded-lg sm:rounded-2xl pl-9 pr-3 py-2 sm:py-4 text-[11px] sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" 
                    placeholder="Full Name" 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[8px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 ml-1">Email</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] sm:text-[20px]">mail</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/60 dark:bg-zinc-800/60 border border-white/20 dark:border-zinc-700/50 rounded-lg sm:rounded-2xl pl-9 pr-3 py-2 sm:py-4 text-[11px] sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" 
                  placeholder="Email" 
                />
              </div>
            </div>
            
            {!isResetPassword && (
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[8px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Password</label>
                  {!isSignUp && (
                    <button type="button" onClick={() => setIsResetPassword(true)} className="text-[8px] sm:text-xs font-bold text-yellow-700">Forgot?</button>
                  )}
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] sm:text-[20px]">lock</span>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!isResetPassword}
                    minLength={6}
                    className="w-full bg-white/60 dark:bg-zinc-800/60 border border-white/20 dark:border-zinc-700/50 rounded-lg sm:rounded-2xl pl-9 pr-3 py-2 sm:py-4 text-[11px] sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" 
                    placeholder="Password" 
                  />
                </div>
              </div>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-slate-900 font-bold py-2.5 sm:py-4 rounded-lg sm:rounded-2xl transition-all shadow-lg mt-1 sm:mt-6 disabled:opacity-50 active:scale-[0.98] text-[12px] sm:text-base"
            >
              {loading ? 'Processing...' : (isResetPassword ? 'Reset' : isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>
        </div>

        <p className="mt-4 sm:mt-8 text-center text-[10px] sm:text-sm text-slate-600 dark:text-zinc-400 font-medium">
          {isSignUp ? 'Already have an account?' : "New here?"} 
          <button onClick={() => { setIsSignUp(!isSignUp); setIsResetPassword(false); }} className="text-yellow-700 dark:text-primary font-bold ml-1">
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
