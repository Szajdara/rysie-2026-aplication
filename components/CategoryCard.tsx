'use client';

import React, { useState } from 'react';
import { CategoryDefinition, TeacherVote } from '@/lib/types';
import { calculateRankings, getCategoryLeader, formatVotesCount, formatTeacherName } from '@/lib/ranking';
import TeacherRow from './TeacherRow';
import {
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

    const formatted = formatTeacherName(trimmed);

    const alreadyExists = teachers.some(
      (t) => t.name.toLowerCase() === formatted.toLowerCase()
    );

    if (alreadyExists) {
      setInputError('Ten nauczyciel już znajduje się na liście tej kategorii');
      return;
    }

    setInputError(null);
    onAddTeacher(category.id, formatted);
    setNewTeacherName('');
  };

  const datalistId = `suggestions-${category.id}`;

  return (
    <div
      id={`cat-${category.id}`}
      className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col h-full backdrop-blur-sm transition-all"
    >
      {/* Category Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800/80">
        <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
          {category.title}
        </h3>

        {/* Total Votes in category badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 text-xs font-bold text-blue-700 dark:text-blue-300">
            <span>{totalCategoryVotes}</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal">gł.</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60">
            <Users className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            <span className="font-semibold text-slate-700 dark:text-zinc-300">{teachers.length}</span>
          </div>
        </div>
      </div>

      {/* Leader highlight banner if available */}
      {leaderInfo && leaderInfo.maxVotes > 0 && (
        <div className="my-3 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-1.5 truncate">
            <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
            <span className="text-slate-500 dark:text-zinc-400">Prowadzi:</span>
            <span className="font-bold text-amber-700 dark:text-amber-300 truncate">
              {leaderInfo.leaderName}
            </span>
          </div>
          <span className="font-extrabold text-amber-600 dark:text-amber-400 ml-2 shrink-0">
            {formatVotesCount(leaderInfo.maxVotes)}
          </span>
        </div>
      )}

      {/* Add Teacher Input Form */}
      <form onSubmit={handleAddSubmit} className="my-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              list={datalistId}
              value={newTeacherName}
              onChange={(e) => {
                setNewTeacherName(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="Imię i nazwisko nauczyciela"
              className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
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
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-xs sm:text-sm text-white flex items-center gap-1 sm:gap-1.5 shadow-md shadow-blue-500/25 active:scale-95 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Dodaj</span>
          </button>
        </div>

        {inputError && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 px-1 font-medium">
            {inputError}
          </p>
        )}
      </form>

      {/* Teachers List */}
      <div className="space-y-2.5 mt-2">
        {rankedTeachers.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 text-xs">
            <Users className="w-7 h-7 mx-auto mb-2 text-slate-400 dark:text-zinc-600" />
            <p className="font-semibold text-slate-600 dark:text-zinc-400">
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
