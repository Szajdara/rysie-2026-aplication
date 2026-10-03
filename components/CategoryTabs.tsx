'use client';

import React from 'react';
import { CATEGORIES } from '@/lib/constants';
import { CategoryId, VotesData } from '@/lib/types';
import { LayoutGrid, Zap, Shield, Search, Flame, Sparkles, Crown } from 'lucide-react';

interface CategoryTabsProps {
  selectedTab: CategoryId | 'all';
  onSelectTab: (tab: CategoryId | 'all') => void;
  votesData: VotesData;
}

const ICON_MAP = {
  Zap,
  Shield,
  Search,
  Flame,
  Sparkles,
  Crown,
};

export default function CategoryTabs({
  selectedTab,
  onSelectTab,
  votesData,
}: CategoryTabsProps) {
  const getTotalVotes = (id: CategoryId) => {
    const teachers = votesData[id] || [];
    return teachers.reduce((acc, t) => acc + t.votes, 0);
  };

  const totalAllVotes = CATEGORIES.reduce((acc, cat) => acc + getTotalVotes(cat.id), 0);

  return (
    <div className="sticky top-[61px] sm:top-[69px] z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800/80 py-2.5 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {/* All categories pill */}
        <button
          onClick={() => onSelectTab('all')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
            selectedTab === 'all'
              ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Wszystkie kategorie (6)</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedTab === 'all'
                ? 'bg-black/20 text-black font-extrabold'
                : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            {totalAllVotes}
          </span>
        </button>

        {/* 6 Category pills */}
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || Crown;
          const votesCount = getTotalVotes(cat.id);
          const isSelected = selectedTab === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectTab(cat.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-amber-500 dark:text-amber-400'}`} />
              <span>{cat.shortTitle}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected
                    ? 'bg-black/20 text-black font-extrabold'
                    : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {votesCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
