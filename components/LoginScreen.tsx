'use client';

import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Award, Sparkles, AlertCircle, Sun, Moon } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function LoginScreen({ onLoginSuccess, theme, onToggleTheme }: LoginScreenProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('rysie_session', JSON.stringify({ user: data.user, time: Date.now() }));
        sessionStorage.setItem('rysie_session', JSON.stringify({ user: data.user, time: Date.now() }));
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Nieprawidłowy login lub hasło. Spróbuj ponownie.');
      }
    } catch {
      setError('Błąd połączenia z serwerem logowania. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/70 via-slate-50 to-slate-200 dark:from-amber-950/30 dark:via-zinc-950 dark:to-black transition-colors relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
          className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 shadow-md backdrop-blur-md active:scale-95 transition-all"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-sky-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>
      </div>

      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Decorative top badge with official Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-600 via-sky-400 to-indigo-600 shadow-[0_0_35px_rgba(59,130,246,0.35)] p-1 mb-4 transform hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-white rounded-full overflow-hidden flex items-center justify-center p-1">
              <img
                src="/logo.png"
                alt="Logo Rysie 2026"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
            RYSIE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600">2026</span>
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 text-sm mt-1.5 font-medium">
            Plebiscyt Nauczycielski • Panel Komisji Skrutacyjnej
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-md text-xs font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>Dostęp chroniony hasłem</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 backdrop-blur-xl rounded-xl p-6 sm:p-8 shadow-2xl shadow-slate-300/50 dark:shadow-black/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-sm animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Login organizatora
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Wpisz login..."
                  required
                  autoFocus
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-700/80 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Hasło dostępu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Wpisz hasło..."
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-700/80 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Weryfikacja...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Otwórz Panel Liczenia Głosów</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 dark:text-zinc-600 mt-6 font-medium">
          System bezpiecznego zliczania głosów • Vercel Ready • Rysie 2026
        </p>
      </div>
    </div>
  );
}
