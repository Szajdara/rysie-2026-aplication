'use client';

import React, { useState } from 'react';
import { SyncMode } from '@/lib/types';
import {
  Cloud,
  HardDrive,
  CheckCircle2,
  X,
  AlertTriangle,
  UploadCloud,
  DownloadCloud,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ModeSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: SyncMode;
  onSwitchMode: (newMode: SyncMode, pushLocalToCloud?: boolean) => void;
  isCloudConnected: boolean;
  localVotesCount: number;
}

export default function ModeSwitchModal({
  isOpen,
  onClose,
  currentMode,
  onSwitchMode,
  isCloudConnected,
  localVotesCount,
}: ModeSwitchModalProps) {
  const [selectedMode, setSelectedMode] = useState<SyncMode>(currentMode);
  const [syncStrategy, setSyncStrategy] = useState<'push_local' | 'pull_cloud'>('push_local');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedMode === currentMode) {
      onClose();
      return;
    }

    if (selectedMode === 'local') {
      onSwitchMode('local');
      onClose();
    } else {
      // Switching to live
      onSwitchMode('live', syncStrategy === 'push_local');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 dark:bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-2xl overflow-y-auto max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <h3 className="font-black text-xl text-slate-900 dark:text-white">
              Tryb pracy aplikacji
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Wybierz, gdzie zapisują się głosy i jak aplikacja się synchronizuje.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode cards */}
        <div className="mt-5 space-y-3">
          {/* 1. Tryb Lokalny (RECOMMENDED WHEN LIVE IS UNSTABLE) */}
          <div
            onClick={() => setSelectedMode('local')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedMode === 'local'
                ? 'bg-amber-500/10 border-amber-500 text-amber-950 dark:text-amber-100 shadow-md shadow-amber-500/10'
                : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  selectedMode === 'local'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      Tryb Lokalny (Offline)
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                      Niezawodny
                    </span>
                  </div>
                  {selectedMode === 'local' && (
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  Zapisuje głosy wyłącznie w pamięci tego telefonu/komputera. <strong>Dane nigdy nie znikną</strong>, nic się nie wywala, działa w 100% bez internetu.
                </p>
                <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-400/90 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Włącz ten tryb natychmiast, gdy baza na żywo szwankuje lub internet przerywa.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Tryb Na Żywo (Cloud) */}
          <div
            onClick={() => setSelectedMode('live')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedMode === 'live'
                ? 'bg-blue-500/10 border-blue-500 text-blue-950 dark:text-blue-100 shadow-md shadow-blue-500/10'
                : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  selectedMode === 'live'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <Cloud className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      Tryb Na Żywo (Chmura)
                    </span>
                    {isCloudConnected ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Chmura OK
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        Baza czeka
                      </span>
                    )}
                  </div>
                  {selectedMode === 'live' && (
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  Synchronizacja w czasie rzeczywistym między wieloma telefonami. Wymaga podłączonej bazy Upstash Redis i dobrego łącza internetowego.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Options when switching from Local to Live with existing votes */}
        {selectedMode === 'live' && currentMode === 'local' && localVotesCount > 0 && (
          <div className="mt-4 p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-2.5 text-xs animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-200">
              <UploadCloud className="w-4 h-4 text-blue-500" />
              <span>Na tym telefonie jest już policzonych {localVotesCount} głosów:</span>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-800 dark:text-zinc-200 p-2 rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-blue-500/20">
                <input
                  type="radio"
                  name="syncStrategy"
                  checked={syncStrategy === 'push_local'}
                  onChange={() => setSyncStrategy('push_local')}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-bold">Wyślij obecne głosy do chmury (Zalecane)</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Twoje dotychczasowe głosy zostaną zachowane i udostępnione innym telefonom.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-800 dark:text-zinc-200 p-2 rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-blue-500/20">
                <input
                  type="radio"
                  name="syncStrategy"
                  checked={syncStrategy === 'pull_cloud'}
                  onChange={() => setSyncStrategy('pull_cloud')}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-bold">Zastąp stanem z bazy w chmurze</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Pobierz głosy, które aktualnie znajdują się na serwerze.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={handleConfirm}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
              selectedMode === 'local'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
            }`}
          >
            <span>
              {selectedMode === currentMode
                ? 'Zamknij'
                : selectedMode === 'local'
                ? 'Włącz Tryb Lokalny'
                : 'Włącz Tryb Na Żywo'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
