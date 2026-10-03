'use client';

import React from 'react';
import { CATEGORIES } from '@/lib/constants';
import { CategoryId, VotesData } from '@/lib/types';
import { LayoutGrid } from 'lucide-react';

interface CategoryTabsProps {
  selectedTab: CategoryId | 'all';
  onSelectTab: (tab: CategoryId | 'all') => void;
  votesData: VotesData;
}

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
    <div className="sticky top-[95px] md:top-[68px] z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800/80 py-2.5 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {/* All categories pill */}
        <button
          onClick={() => onSelectTab('all')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
            selectedTab === 'all'
              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Wszystkie kategorie (6)</span>
          <span
            className={`px-1.5 py-0.2 rounded-md text-[10px] ${
              selectedTab === 'all'
                ? 'bg-white/20 text-white font-extrabold'
                : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            {totalAllVotes}
          </span>
        </button>

        {/* 6 Category pills */}
        {CATEGORIES.map((cat) => {
          const votesCount = getTotalVotes(cat.id);
          const isSelected = selectedTab === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectTab(cat.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800/80'
              }`}
            >
              <span>{cat.shortTitle}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  isSelected
                    ? 'bg-white/20 text-white font-extrabold'
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
