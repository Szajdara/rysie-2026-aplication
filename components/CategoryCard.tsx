'use client';

import React, { useState } from 'react';
import { CategoryDefinition, TeacherVote } from '@/lib/types';
import { calculateRankings, getCategoryLeader } from '@/lib/ranking';
import TeacherRow from './TeacherRow';
import {
  Zap,
  Shield,
  Search,
  Flame,
  Sparkles,
  Crown,
  UserPlus,
  Trophy,
  Users,
} from 'lucide-react';

interface CategoryCardProps {
  category: CategoryDefinition;
  teachers: TeacherVote[];
  allKnownTeacherNames: string[];
  onAddTeacher: (categoryId: CategoryDefinition['id'], name: string) => void;
  onIncrementVote: (
    categoryId: CategoryDefinition['id'],
    teacherId: string,
    delta?: number
  ) => void;
  onDecrementVote: (
    categoryId: CategoryDefinition['id'],
    teacherId: string
  ) => void;
  onDeleteTeacher: (
    categoryId: CategoryDefinition['id'],
    teacherId: string
  ) => void;
}

const ICON_MAP = {
  Zap,
  Shield,
  Search,
  Flame,
  Sparkles,
  Crown,
};

export default function CategoryCard({
  category,
  teachers,
  allKnownTeacherNames,
  onAddTeacher,
  onIncrementVote,
  onDecrementVote,
  onDeleteTeacher,
}: CategoryCardProps) {
  const [newTeacherName, setNewTeacherName] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const Icon = ICON_MAP[category.iconName] || Trophy;
  const rankedTeachers = calculateRankings(teachers);
  const leaderInfo = getCategoryLeader(teachers);
  const totalCategoryVotes = teachers.reduce((sum, t) => sum + t.votes, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTeacherName.trim();

    if (!trimmed) {
      setInputError('Wpisz imię i nazwisko');
      return;
    }

    // Check if teacher already exists in this category
    const alreadyExists = teachers.some(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      setInputError('Ten nauczyciel już znajduje się na liście tej kategorii');
      return;
    }

    setInputError(null);
    onAddTeacher(category.id, trimmed);
    setNewTeacherName('');
  };

  const datalistId = `suggestions-${category.id}`;

  return (
    <div
      id={`cat-${category.id}`}
      className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-full backdrop-blur-sm transition-all"
    >
      {/* Category Header */}
      <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-zinc-800/80">
        <div className="flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${category.badgeColor} p-0.5 shadow-md flex items-center justify-center shrink-0 mt-0.5`}
          >
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Icon className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight leading-snug">
              {category.title}
            </h3>
            <p className="text-xs text-amber-400/90 font-medium italic">
              {category.tagline}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
              {category.description}
            </p>
          </div>
        </div>

        {/* Total Votes in category badge */}
        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-xs font-bold text-amber-300">
            <span>{totalCategoryVotes}</span>
            <span className="text-[10px] text-zinc-400 font-normal">gł.</span>
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 flex items-center justify-end gap-1">
            <Users className="w-3 h-3" />
            <span>{teachers.length}</span>
          </div>
        </div>
      </div>

      {/* Leader highlight banner if available */}
      {leaderInfo && leaderInfo.maxVotes > 0 && (
        <div className="my-3 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-1.5 truncate">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-zinc-400">Prowadzi:</span>
            <span className="font-bold text-amber-300 truncate">
              {leaderInfo.leaderName}
            </span>
          </div>
          <span className="font-extrabold text-amber-400 ml-2 shrink-0">
            {leaderInfo.maxVotes} {leaderInfo.maxVotes === 1 ? 'głos' : 'głosy'}
          </span>
        </div>
      )}

      {/* Add Teacher Input Form */}
      <form onSubmit={handleAddSubmit} className="my-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              list={datalistId}
              value={newTeacherName}
              onChange={(e) => {
                setNewTeacherName(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="Wpisz imię i nazwisko nauczyciela..."
              className="w-full px-3.5 py-2.5 bg-zinc-950/90 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
            {/* Suggestions datalist */}
            <datalist id={datalistId}>
              {allKnownTeacherNames.map((name, idx) => (
                <option key={idx} value={name} />
              ))}
            </datalist>
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 font-bold text-xs sm:text-sm text-zinc-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Dodaj</span>
          </button>
        </div>

        {inputError && (
          <p className="text-red-400 text-xs mt-1.5 px-1 font-medium">
            {inputError}
          </p>
        )}
      </form>

      {/* Teachers List */}
      <div className="space-y-2.5 mt-2">
        {rankedTeachers.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-xs">
            <Users className="w-7 h-7 mx-auto mb-2 text-zinc-600" />
            <p className="font-semibold text-zinc-400">
              Brak nauczycieli w tej kategorii
            </p>
            <p className="mt-1 text-[11px]">
              Wpisz nazwisko w polu powyżej i kliknij „Dodaj”, aby rozpocząć
              liczenie głosów.
            </p>
          </div>
        ) : (
          rankedTeachers.map((teacher) => (
            <TeacherRow
              key={teacher.id}
              teacher={teacher}
              onIncrement={(id, delta) => onIncrementVote(category.id, id, delta)}
              onDecrement={(id) => onDecrementVote(category.id, id)}
              onDelete={(id) => onDeleteTeacher(category.id, id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
