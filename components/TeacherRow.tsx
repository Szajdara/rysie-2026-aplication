'use client';

import React, { useState } from 'react';
import { RankedTeacher } from '@/lib/types';
import { Plus, Minus, Trophy, Medal, Trash2, Check, X } from 'lucide-react';

interface TeacherRowProps {
  teacher: RankedTeacher;
  onIncrement: (teacherId: string, delta?: number) => void;
  onDecrement: (teacherId: string) => void;
  onDelete: (teacherId: string) => void;
}

export default function TeacherRow({
  teacher,
  onIncrement,
  onDecrement,
  onDelete,
}: TeacherRowProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [justBumped, setJustBumped] = useState(false);

  const handlePlus = (delta: number = 1) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
    setJustBumped(true);
    setTimeout(() => setJustBumped(false), 300);
    onIncrement(teacher.id, delta);
  };

  const handleMinus = () => {
    if (teacher.votes <= 0) return;
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onDecrement(teacher.id);
  };

  const isWinner = teacher.status === 'winner';
  const isNominee = teacher.status === 'nominee';

  // Card container styling
  let containerStyle =
    'bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700/80 text-zinc-300';
  let badgeStyle = 'bg-zinc-800 text-zinc-400 border border-zinc-700/50';

  if (isWinner) {
    containerStyle =
      'bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-950/40 border-amber-400 gold-card-glow text-amber-50';
    badgeStyle =
      'bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 font-black shadow-md shadow-amber-500/30';
  } else if (isNominee) {
    containerStyle =
      'bg-gradient-to-br from-slate-400/20 via-zinc-400/10 to-slate-900/40 border-slate-300 silver-card-glow text-slate-100';
    badgeStyle =
      'bg-gradient-to-r from-slate-200 to-zinc-300 text-zinc-950 font-bold shadow-md shadow-slate-400/20';
  }

  return (
    <div
      className={`rounded-2xl p-3.5 border transition-all duration-200 ${containerStyle} ${
        justBumped ? 'scale-[1.01]' : ''
      }`}
    >
      {/* 1. Top Row: Badge + Teacher Name + Delete Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Rank Badge */}
          <div
            className={`shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs tracking-tight ${badgeStyle}`}
          >
            {isWinner ? (
              <>
                <Trophy className="w-3.5 h-3.5 shrink-0 text-zinc-950" />
                <span className="font-extrabold uppercase text-[11px]">
                  {teacher.isTied ? 'Lider (Ex aequo)' : '1. Zwycięzca'}
                </span>
              </>
            ) : isNominee ? (
              <>
                <Medal className="w-3.5 h-3.5 shrink-0 text-zinc-950" />
                <span className="font-bold uppercase text-[11px]">
                  {teacher.rank === 2 ? '2. Nominowany' : '3. Nominowany'}
                </span>
              </>
            ) : (
              <span className="font-semibold text-xs text-zinc-400 px-1">
                {teacher.votes > 0 ? `#${teacher.rank}` : '—'}
              </span>
            )}
          </div>

          {/* Teacher Name */}
          <h4
            className={`text-sm sm:text-base font-bold truncate leading-snug ${
              isWinner ? 'text-amber-200' : isNominee ? 'text-slate-100' : 'text-zinc-200'
            }`}
            title={teacher.name}
          >
            {teacher.name}
          </h4>
        </div>

        {/* Delete Confirmation or Trash Icon */}
        <div className="shrink-0">
          {showConfirmDelete ? (
            <div className="flex items-center gap-1 bg-red-950/90 border border-red-700 rounded-xl p-1 animate-fadeIn">
              <button
                type="button"
                onClick={() => onDelete(teacher.id)}
                title="Potwierdź usunięcie"
                className="w-7 h-7 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center justify-center active:scale-90 transition-transform"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                title="Anuluj"
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              title="Usuń nauczyciela z tej kategorii"
              className="w-7 h-7 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/15 flex items-center justify-center transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Bottom Row: Vote Status Text on the Left, Full Touch Controls on the Right */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
        {/* Status text */}
        <div className="text-xs">
          {teacher.votes === 0 ? (
            <span className="text-zinc-500 italic">Brak głosów</span>
          ) : (
            <span
              className={`font-semibold ${
                isWinner
                  ? 'text-amber-300'
                  : isNominee
                  ? 'text-slate-300'
                  : 'text-zinc-400'
              }`}
            >
              {teacher.votes} {teacher.votes === 1 ? 'głos' : 'głosy'}
            </span>
          )}
        </div>

        {/* Counter controls: [-] [ Votes ] [+] [+5] */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick -1 button */}
          <button
            type="button"
            onClick={handleMinus}
            disabled={teacher.votes <= 0}
            title="Odejmij 1 głos"
            className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-zinc-200 disabled:opacity-25 disabled:pointer-events-none border border-zinc-700/80 flex items-center justify-center font-bold text-lg active:scale-90 transition-all select-none shadow-sm"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Current Vote Display */}
          <div
            className={`min-w-[40px] text-center font-black text-xl tabular-nums select-none ${
              isWinner
                ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                : isNominee
                ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]'
                : 'text-zinc-200'
            }`}
          >
            {teacher.votes}
          </div>

          {/* Quick +1 button */}
          <button
            type="button"
            onClick={() => handlePlus(1)}
            title="Dodaj 1 głos"
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg active:scale-90 transition-all shadow-md select-none ${
              isWinner
                ? 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black shadow-amber-500/25'
                : isNominee
                ? 'bg-slate-200 hover:bg-white active:bg-slate-300 text-zinc-950 shadow-slate-400/20'
                : 'bg-amber-500/90 hover:bg-amber-400 active:bg-amber-600 text-black shadow-amber-500/10'
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Quick +5 button */}
          <button
            type="button"
            onClick={() => handlePlus(5)}
            title="Dodaj 5 głosów naraz"
            className="px-2.5 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-xs font-bold text-zinc-300 hover:text-white border border-zinc-700/70 flex items-center justify-center active:scale-90 transition-all select-none"
          >
            +5
          </button>
        </div>
      </div>
    </div>
  );
}
