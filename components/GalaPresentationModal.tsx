'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CATEGORIES } from '@/lib/constants';
import { CategoryId, VotesData } from '@/lib/types';
import { calculateRankings } from '@/lib/ranking';
import {
  Trophy,
  Medal,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
  Crown,
} from 'lucide-react';

interface GalaPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  votesData: VotesData;
}

export default function GalaPresentationModal({
  isOpen,
  onClose,
  votesData,
}: GalaPresentationModalProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [revealedCategories, setRevealedCategories] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const currentCategory = CATEGORIES[currentCategoryIndex];
  const teachers = votesData[currentCategory.id] || [];
  const rankedTeachers = calculateRankings(teachers);

  const winner = rankedTeachers.find((t) => t.status === 'winner');
  const nominees = rankedTeachers.filter((t) => t.status === 'nominee');
  const isRevealed = Boolean(revealedCategories[currentCategory.id]);

  const fireGalaConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#ffffff', '#cbd5e1', '#d97706'],
    });
  };

  const handleRevealWinner = () => {
    setRevealedCategories((prev) => ({
      ...prev,
      [currentCategory.id]: true,
    }));
    fireGalaConfetti();
  };

  const handleNext = () => {
    if (currentCategoryIndex < CATEGORIES.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl animate-fadeIn">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.15)_0%,_transparent_70%)] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-[0_0_80px_rgba(245,158,11,0.25)] flex flex-col justify-between min-h-[580px] max-h-[92vh] overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span className="font-black text-lg text-amber-300 tracking-wider">
              GALA RYSIE 2026
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
              Kategoria {currentCategoryIndex + 1} z {CATEGORIES.length}
            </span>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Header */}
        <div className="text-center my-6">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-extrabold">
            Plebiscyt Uczniowski
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            {currentCategory.title}
          </h2>
          <p className="text-amber-300/80 font-serif italic text-base sm:text-lg mt-2">
            {currentCategory.tagline}
          </p>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto mt-1">
            {currentCategory.description}
          </p>
        </div>

        {/* Content Area: Nominees and Winner */}
        <div className="flex-1 flex flex-col items-center justify-center my-4 space-y-6">
          {/* Nominees Section (Silver) */}
          <div className="w-full max-w-xl">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              <Medal className="w-4 h-4 text-slate-300" />
              <span>Srebrni Nominowani Nauczyciele</span>
            </div>

            {nominees.length === 0 ? (
              <p className="text-center text-xs text-zinc-500 py-3">
                Brak nominowanych w tej kategorii (brak głosów).
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nominees.map((nominee) => (
                  <div
                    key={nominee.id}
                    className="p-4 rounded-2xl bg-zinc-900/90 border border-slate-300/70 silver-card-glow text-center transform transition-transform hover:scale-[1.02]"
                  >
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-1 mb-1">
                      <Medal className="w-3.5 h-3.5 text-slate-300" />
                      <span>{nominee.rank}. Miejsce</span>
                    </span>
                    <h4 className="font-extrabold text-base sm:text-lg text-white">
                      {nominee.name}
                    </h4>
                    <span className="text-xs text-slate-300 font-semibold">
                      {nominee.votes} {nominee.votes === 1 ? 'głos' : 'głosów'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Winner Section (Gold) */}
          <div className="w-full max-w-xl pt-2">
            {!winner ? (
              <div className="text-center p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-sm">
                Brak zarejestrowanych głosów dla wyłonienia zwycięzcy.
              </div>
            ) : !isRevealed ? (
              <div className="text-center py-4">
                <button
                  type="button"
                  onClick={handleRevealWinner}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 font-black text-lg sm:text-xl shadow-[0_0_40px_rgba(245,158,11,0.5)] transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto"
                >
                  <Trophy className="w-6 h-6 text-zinc-950 animate-bounce" />
                  <span>ODKRYJ ZWYCIĘZCĘ RYSIE 2026!</span>
                  <Sparkles className="w-6 h-6 text-zinc-950" />
                </button>
              </div>
            ) : (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-500/30 via-yellow-500/15 to-zinc-950 border-2 border-amber-400 gold-card-glow text-center transform animate-fadeIn">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-zinc-950 shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-3 animate-pulse">
                  <Crown className="w-8 h-8" />
                </div>
                <div className="text-xs font-black text-amber-400 uppercase tracking-[0.2em] mb-1">
                  LAUREAT STATUETKI RYSIE 2026
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                  {winner.name}
                </h3>
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400 text-zinc-950 font-extrabold text-sm mt-3 shadow-md">
                  <Trophy className="w-4 h-4" />
                  <span>
                    ZWYCIĘZCA • {winner.votes}{' '}
                    {winner.votes === 1 ? 'głos' : 'głosów'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <button
            onClick={handlePrev}
            disabled={currentCategoryIndex === 0}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Poprzednia</span>
          </button>

          {/* Category indicators */}
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => setCurrentCategoryIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentCategoryIndex
                    ? 'bg-amber-400 scale-125'
                    : 'bg-zinc-700 hover:bg-zinc-500'
                }`}
                title={cat.title}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentCategoryIndex === CATEGORIES.length - 1}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Następna</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
