'use client';

import React from 'react';
import { CATEGORIES } from '@/lib/constants';
import { VotesData } from '@/lib/types';
import { calculateRankings } from '@/lib/ranking';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface OfficialProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  votesData: VotesData;
}

export default function OfficialProtocolModal({
  isOpen,
  onClose,
  votesData,
}: OfficialProtocolModalProps) {
  if (!isOpen) return null;

  const totalAllVotes = CATEGORIES.reduce((acc, cat) => {
    const list = votesData[cat.id] || [];
    return acc + list.reduce((s, t) => s + t.votes, 0);
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-zinc-900 rounded-xl p-6 sm:p-10 shadow-2xl my-auto print:p-0 print:shadow-none print:w-full print:max-w-none">
        {/* Controls - Hidden during print */}
        <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-lg text-zinc-900">
              Podgląd Protokołu Końcowego
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Drukuj / Zapisz jako PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="print-content space-y-6 text-zinc-900">
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-zinc-900 flex flex-col items-center">
            <img
              src="/logo.png"
              alt="Logo Rysie 2026"
              className="w-16 h-16 object-contain mb-2 rounded-full"
            />
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-1">
              DOKUMENTACJA OFICJALNA
            </p>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Protokół Komisji Skrutacyjnej
            </h1>
            <p className="text-base font-bold text-blue-900 mt-1">
              Plebiscyt Nauczycielski „RYSIE 2026”
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Sporządzono w dniu: {currentDate}
            </p>
          </div>

          {/* Intro text */}
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
            Komisja Skrutacyjna powołana do przeliczenia głosów w dorocznym
            plebiscycie nauczycielskim <strong>„Rysie 2026”</strong> stwierdza,
            że w głosowaniu oddano łącznie <strong>{totalAllVotes}</strong>{' '}
            ważnych głosów. Wyniki w poszczególnych kategoriach przedstawiają
            się następująco:
          </p>

          {/* Table */}
          <div className="overflow-x-auto border border-zinc-300 rounded-lg">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-100 border-b border-zinc-300 text-zinc-800 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-8">Lp.</th>
                  <th className="py-2.5 px-3">Kategoria</th>
                  <th className="py-2.5 px-3">Zwycięzca (Złoty Ryś 🥇)</th>
                  <th className="py-2.5 px-3">Nominowani (Srebro 🥈)</th>
                  <th className="py-2.5 px-3 text-right">Suma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {CATEGORIES.map((cat, idx) => {
                  const list = votesData[cat.id] || [];
                  const ranked = calculateRankings(list);
                  const winners = ranked.filter((t) => t.status === 'winner');
                  const nominees = ranked.filter((t) => t.status === 'nominee');
                  const catTotal = list.reduce((s, t) => s + t.votes, 0);

                  return (
                    <tr key={cat.id} className="hover:bg-zinc-50">
                      <td className="py-3 px-3 font-bold text-zinc-500">
                        {idx + 1}.
                      </td>
                      <td className="py-3 px-3 font-semibold text-zinc-900">
                        <div>{cat.title}</div>
                      </td>
                      <td className="py-3 px-3">
                        {winners.length > 0 ? (
                          winners.map((w) => (
                            <div key={w.id} className="font-bold text-amber-900">
                              🥇 {w.name}{' '}
                              <span className="font-normal text-xs text-zinc-600">
                                ({w.votes} gł.)
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-zinc-400 italic">Brak</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-zinc-700">
                        {nominees.length > 0 ? (
                          nominees.map((n) => (
                            <div key={n.id} className="text-xs">
                              🥈 {n.name}{' '}
                              <span className="text-zinc-500">
                                ({n.votes} gł.)
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-zinc-400 italic text-xs">
                            Brak nominowanych
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-zinc-900">
                        {catTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signatures section */}
          <div className="pt-8 mt-6 border-t border-zinc-200 print-break-inside-avoid">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-6">
              Podpisy Członków Komisji Skrutacyjnej:
            </p>
            <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
              <div>
                <div className="border-b border-dotted border-zinc-400 pb-8 mb-1.5" />
                <span className="font-semibold text-zinc-700">
                  Przewodniczący Komisji
                </span>
              </div>
              <div>
                <div className="border-b border-dotted border-zinc-400 pb-8 mb-1.5" />
                <span className="font-semibold text-zinc-700">
                  Członek Komisji
                </span>
              </div>
              <div>
                <div className="border-b border-dotted border-zinc-400 pb-8 mb-1.5" />
                <span className="font-semibold text-zinc-700">
                  Członek Komisji
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
