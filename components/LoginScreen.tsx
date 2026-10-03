'use client';

import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Award, Sparkles, CheckCircle2, AlertCircle, Sun, Moon } from 'lucide-react';
import { DEFAULT_AUTH_CREDENTIALS } from '@/lib/constants';

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
        sessionStorage.setItem('rysie_session', JSON.stringify({ user: data.user, time: Date.now() }));
        onLoginSuccess(data.user);
      } else {
        if (
          login.trim().toLowerCase() === DEFAULT_AUTH_CREDENTIALS.login.toLowerCase() &&
          password.trim() === DEFAULT_AUTH_CREDENTIALS.password
        ) {
          sessionStorage.setItem('rysie_session', JSON.stringify({ user: login, time: Date.now() }));
          onLoginSuccess(login);
        } else {
          setError(data.message || 'Nieprawidłowy login lub hasło. Spróbuj ponownie.');
        }
      }
    } catch {
      if (
        login.trim().toLowerCase() === DEFAULT_AUTH_CREDENTIALS.login.toLowerCase() &&
        password.trim() === DEFAULT_AUTH_CREDENTIALS.password
      ) {
        sessionStorage.setItem('rysie_session', JSON.stringify({ user: login, time: Date.now() }));
        onLoginSuccess(login);
      } else {
        setError('Błąd połączenia. Sprawdź dane logowania.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setLogin(DEFAULT_AUTH_CREDENTIALS.login);
    setPassword(DEFAULT_AUTH_CREDENTIALS.password);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/70 via-slate-50 to-slate-200 dark:from-amber-950/30 dark:via-zinc-950 dark:to-black transition-colors relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
          className="p-2.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 shadow-md backdrop-blur-md active:scale-95 transition-all"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>
      </div>

      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Decorative top badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 shadow-[0_0_40px_rgba(245,158,11,0.35)] p-0.5 mb-4 transform hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[22px] flex items-center justify-center">
              <Award className="w-10 h-10 text-amber-500 dark:text-amber-400" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
            RYSIE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600">2026</span>
          </h1>
          <p className="text-slate-600 dark:text-zinc-400 text-sm mt-1.5 font-medium">
            Plebiscyt Nauczycielski • Panel Komisji Skrutacyjnej
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Dostęp chroniony hasłem</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-300/50 dark:shadow-black/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-sm animate-shake">
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
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all text-base"
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
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all text-base"
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
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
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

          {/* Quick preset helper */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-zinc-800/80 text-center">
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-2 font-medium">
              Domyślne dane dostępowe dla organizatorów:
            </p>
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 border border-slate-200 dark:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>
                Login: <strong className="text-amber-600 dark:text-amber-300">organizator</strong> / Hasło: <strong className="text-amber-600 dark:text-amber-300">rysie2026</strong>
              </span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 dark:text-zinc-600 mt-6 font-medium">
          System bezpiecznego zliczania głosów • Vercel Ready • Rysie 2026
        </p>
      </div>
    </div>
  );
}
