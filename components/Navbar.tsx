'use client';

import React from 'react';
import { SyncMode } from '@/lib/types';
import {
  FileText,
  RotateCcw,
  LogOut,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Moon,
  HardDrive,
  Cloud,
  AlertTriangle,
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
  syncMode: SyncMode;
  isCloudSynced?: boolean;
  cloudError?: string | null;
  onOpenModeSwitch: () => void;
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
  syncMode,
  isCloudSynced = false,
  cloudError = null,
  onOpenModeSwitch,
}: NavbarProps) {
  const renderModeBadge = (isMobile: boolean = false) => {
    if (syncMode === 'local') {
      return (
        <button
          onClick={onOpenModeSwitch}
          type="button"
          title="Pracujesz w bezpiecznym trybie lokalnym. Kliknij, aby zmienić tryb."
          className={`inline-flex items-center gap-1.5 rounded-lg border font-bold transition-all shadow-sm active:scale-95 cursor-pointer bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/25 ${
            isMobile ? 'text-[11px] px-2 py-1' : 'text-xs px-2.5 py-1'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Tryb lokalny</span>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-normal underline ml-0.5">
            zmień
          </span>
        </button>
      );
    }

    if (cloudError) {
      return (
        <button
          onClick={onOpenModeSwitch}
          type="button"
          title={`Problem z chmurą: ${cloudError}. Kliknij, aby przełączyć na bezpieczny tryb lokalny.`}
          className={`inline-flex items-center gap-1.5 rounded-lg border font-bold transition-all shadow-sm active:scale-95 cursor-pointer bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/40 hover:bg-red-500/25 animate-pulse ${
            isMobile ? 'text-[11px] px-2 py-1' : 'text-xs px-2.5 py-1'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span>{isMobile ? 'Błąd na żywo' : 'Błąd bazy na żywo'}</span>
          <span className="text-[10px] font-normal underline ml-0.5">
            przełącz
          </span>
        </button>
      );
    }

    if (isCloudSynced) {
      return (
        <button
          onClick={onOpenModeSwitch}
          type="button"
          title="Połączono z bazą chmurową. Głosy synchronizują się na żywo między wszystkimi urządzeniami. Kliknij, aby zmienić tryb."
          className={`inline-flex items-center gap-1.5 rounded-lg border font-bold transition-all shadow-sm active:scale-95 cursor-pointer bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25 ${
            isMobile ? 'text-[11px] px-2 py-1' : 'text-xs px-2.5 py-1'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>Na żywo</span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-normal underline ml-0.5">
            zmień
          </span>
        </button>
      );
    }

    return (
      <button
        onClick={onOpenModeSwitch}
        type="button"
        title="Baza w chmurze nie jest podłączona lub czeka na dane. Kliknij, aby zmienić tryb."
        className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold transition-all shadow-sm active:scale-95 cursor-pointer bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 ${
          isMobile ? 'text-[11px] px-2 py-1' : 'text-xs px-2.5 py-1'
        }`}
      >
        <Cloud className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>Chmura (oczekiwanie)</span>
        <span className="text-[10px] font-normal underline ml-0.5">zmień</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800/80 px-3 py-2.5 sm:px-6 sm:py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-3">
        {/* Brand and stats */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full p-0.5 bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-600 shadow-md shadow-blue-500/25 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-full overflow-hidden flex items-center justify-center p-0.5">
                <img
                  src="/logo.png"
                  alt="Logo Rysie 2026"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  RYSIE <span className="text-blue-600 dark:text-blue-400">2026</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 whitespace-nowrap shrink-0">
                  Panel Komisji
                </span>
                {/* Desktop Mode Toggle Badge */}
                <div className="hidden md:inline-flex items-center">
                  {renderModeBadge(false)}
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1.5">
                <span>Plebiscyt Nauczycielski</span>
                <span>•</span>
                {syncMode === 'local' ? (
                  <span className="text-amber-700 dark:text-amber-400 font-medium">
                    Zapis lokalny (bezpieczny offline)
                  </span>
                ) : isCloudSynced ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Synchronizacja na żywo
                  </span>
                ) : (
                  <span>Próba połączenia z chmurą</span>
                )}
              </p>
            </div>
          </div>

          {/* Mobile quick stats, mode badge & theme toggle */}
          <div className="flex md:hidden items-center gap-1.5 text-xs shrink-0">
            {renderModeBadge(true)}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 active:scale-95 transition-all shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-sky-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
            <div className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              <span className="whitespace-nowrap">
                <strong className="text-blue-600 dark:text-blue-400 font-bold">{totalVotes}</strong> gł.
              </span>
            </div>
          </div>
        </div>

        {/* Global Statistics & Action Buttons */}
        <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 flex-wrap">
          {/* Desktop Stats Badges */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-2">
              <span className="text-slate-500 dark:text-zinc-500">Oddanych głosów:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{totalVotes}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-2">
              <span className="text-slate-500 dark:text-zinc-500">Wpisanych kandydatur:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{totalTeachers}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-0.5 md:pb-0 justify-between sm:justify-start">
            {/* Theme Toggle Button (Desktop) */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
              className="hidden md:flex p-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 transition-all items-center justify-center active:scale-95 shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-sky-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Undo button */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Cofnij ostatnie kliknięcie +/-"
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 active:scale-95 shrink-0 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Cofnij</span>
            </button>

            {/* Official Protocol button */}
            <button
              onClick={onOpenProtocol}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 text-slate-800 dark:text-zinc-200 transition-all flex items-center gap-1.5 active:scale-95 shrink-0 whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              <span className="whitespace-nowrap">Protokół A4</span>
            </button>

            {/* Backup & Tools button */}
            <button
              onClick={onOpenBackup}
              title="Kopia zapasowa, tryb pracy i narzędzia"
              className="p-1.5 sm:p-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 transition-all flex items-center justify-center active:scale-95 shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title={`Zalogowano jako: ${user}. Kliknij, aby wylogować.`}
              className="p-1.5 sm:p-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-red-50 dark:bg-zinc-900/80 dark:hover:bg-red-950/60 border border-slate-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-800/60 text-slate-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-300 transition-all flex items-center justify-center active:scale-95 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
