'use client';

import React from 'react';
import {
  Award,
  FileText,
  RotateCcw,
  LogOut,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  user: string;
  totalVotes: number;
  totalTeachers: number;
  canUndo: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onUndo: () => void;
  onOpenProtocol: () => void;
  onOpenBackup: () => void;
  onLogout: () => void;
  isCloudSynced?: boolean;
}

export default function Navbar({
  user,
  totalVotes,
  totalTeachers,
  canUndo,
  theme,
  onToggleTheme,
  onUndo,
  onOpenProtocol,
  onOpenBackup,
  onLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800/80 px-4 py-3 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand and stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  RYSIE <span className="text-amber-500 dark:text-amber-400">2026</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Panel Komisji
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Plebiscyt Nauczycielski • 6 Kategorii
              </p>
            </div>
          </div>

          {/* Mobile quick stats & theme toggle */}
          <div className="flex md:hidden items-center gap-2 text-xs">
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 active:scale-95 transition-all"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
            <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>
                <strong className="text-amber-600 dark:text-amber-400 font-bold">{totalVotes}</strong> gł.
              </span>
            </div>
          </div>
        </div>

        {/* Global Statistics & Action Buttons */}
        <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 flex-wrap">
          {/* Desktop Stats Badges */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-2">
              <span className="text-slate-500 dark:text-zinc-500">Oddanych głosów:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{totalVotes}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-2">
              <span className="text-slate-500 dark:text-zinc-500">Wpisanych kandydatur:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{totalTeachers}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Theme Toggle Button (Desktop) */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
              className="hidden md:flex p-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 transition-all items-center justify-center active:scale-95 shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Undo button */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Cofnij ostatnie kliknięcie +/-"
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cofnij</span>
            </button>

            {/* Official Protocol button */}
            <button
              onClick={onOpenProtocol}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 text-slate-800 dark:text-zinc-200 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>Protokół A4</span>
            </button>

            {/* Backup & Tools button */}
            <button
              onClick={onOpenBackup}
              title="Kopia zapasowa, eksport i narzędzia"
              className="p-1.5 sm:p-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 transition-all flex items-center justify-center active:scale-95 shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title={`Zalogowano jako: ${user}. Kliknij, aby wylogować.`}
              className="p-1.5 sm:p-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-red-50 dark:bg-zinc-900/80 dark:hover:bg-red-950/60 border border-slate-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-800/60 text-slate-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-300 transition-all flex items-center justify-center active:scale-95 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
