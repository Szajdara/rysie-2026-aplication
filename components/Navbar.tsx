'use client';

import React from 'react';
import {
  Award,
  Trophy,
  FileText,
  RotateCcw,
  LogOut,
  SlidersHorizontal,
  CloudCheck,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  user: string;
  totalVotes: number;
  totalTeachers: number;
  canUndo: boolean;
  onUndo: () => void;
  onOpenGala: () => void;
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
  onUndo,
  onOpenGala,
  onOpenProtocol,
  onOpenBackup,
  onLogout,
  isCloudSynced,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 sm:px-6">
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
                <span className="font-black text-lg sm:text-xl tracking-tight text-white">
                  RYSIE <span className="text-amber-400">2026</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Panel Komisji
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Plebiscyt Nauczycielski • 6 Kategorii
              </p>
            </div>
          </div>

          {/* Mobile quick stats */}
          <div className="flex md:hidden items-center gap-2 text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                <strong className="text-amber-400 font-bold">{totalVotes}</strong> gł.
              </span>
            </div>
          </div>
        </div>

        {/* Global Statistics & Action Buttons */}
        <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 flex-wrap">
          {/* Desktop Stats Badges */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
              <span className="text-zinc-500">Oddanych głosów:</span>
              <span className="font-bold text-amber-400 text-sm">{totalVotes}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
              <span className="text-zinc-500">Wpisanych kandydatur:</span>
              <span className="font-bold text-white text-sm">{totalTeachers}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Undo button */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Cofnij ostatnie kliknięcie +/-"
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cofnij</span>
            </button>

            {/* Gala Presentation Mode button */}
            <button
              onClick={onOpenGala}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <Trophy className="w-4 h-4 text-black" />
              <span>Tryb Gali</span>
            </button>

            {/* Official Protocol button */}
            <button
              onClick={onOpenProtocol}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Protokół A4</span>
            </button>

            {/* Backup & Tools button */}
            <button
              onClick={onOpenBackup}
              title="Kopia zapasowa, eksport i ustawienia"
              className="p-1.5 sm:p-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-all flex items-center justify-center active:scale-95 shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title={`Zalogowano jako: ${user}. Kliknij, aby wylogować.`}
              className="p-1.5 sm:p-2 rounded-xl text-xs font-semibold bg-zinc-900/80 hover:bg-red-950/60 border border-zinc-800 hover:border-red-800/60 text-zinc-400 hover:text-red-300 transition-all flex items-center justify-center active:scale-95 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
