'use client';

import React, { useState } from 'react';
import { CATEGORIES } from '@/lib/constants';
import { VotesData } from '@/lib/types';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Cloud,
  Database,
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  votesData: VotesData;
  onRestoreData: (restored: VotesData) => void;
  onResetAllData: () => void;
  isCloudSynced?: boolean;
}

export default function BackupModal({
  isOpen,
  onClose,
  votesData,
  onRestoreData,
  onResetAllData,
  isCloudSynced = false,
}: BackupModalProps) {
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPasswordInput.trim();
    if (!trimmed) {
      setErrorMessage('Wpisz nowe hasło.');
      return;
    }
    if (trimmed.length < 3) {
      setErrorMessage('Hasło powinno mieć co najmniej 3 znaki.');
      return;
    }
    try {
      localStorage.setItem('rysie_custom_password', trimmed);
      setSuccessMessage(`Nowe hasło zostało zapisane: "${trimmed}"`);
      setNewPasswordInput('');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      setErrorMessage('Nie udało się zapisać hasła w przeglądarce.');
    }
  };

  if (!isOpen) return null;

  // Export JSON
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(votesData, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `rysie_2026_kopia_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSuccessMessage('Pobrano plik kopii zapasowej JSON.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Export CSV for Excel
  const handleExportCSV = () => {
    let csvContent = '\uFEFF';
    csvContent += 'Kategoria;Imię i nazwisko;Liczba głosów;Status\n';

    CATEGORIES.forEach((cat) => {
      const list = votesData[cat.id] || [];
      list.forEach((t) => {
        csvContent += `"${cat.title}";"${t.name}";${t.votes};"${
          t.votes > 0 ? 'Głosy oddane' : 'Brak głosów'
        }"\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `rysie_2026_wyniki_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();

    setSuccessMessage('Wyeksportowano arkusz CSV do otwarcia w programie Excel.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Import JSON
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (typeof parsed === 'object' && parsed !== null) {
          onRestoreData(parsed);
          setSuccessMessage('Pomyślnie przywrócono dane z pliku!');
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setErrorMessage('Nieprawidłowy format pliku JSON.');
        }
      } catch {
        setErrorMessage('Błąd odczytu pliku kopii zapasowej.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Reset
  const handleResetSubmit = () => {
    if (resetConfirmInput.trim().toUpperCase() === 'RESET') {
      onResetAllData();
      setResetConfirmInput('');
      setSuccessMessage('Wszystkie głosy zostały zresetowane.');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } else {
      setErrorMessage('Wpisz dokładnie słowo RESET, aby potwierdzić.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 dark:bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-7 shadow-2xl overflow-y-auto max-h-[90vh] transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
            Kopia Zapasowa i Narzędzia
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs sm:text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action list */}
        <div className="mt-6 space-y-4">
          {/* Cloud Sync Status Info Box */}
          <div
            className={`p-3.5 rounded-lg border flex items-start gap-3 transition-colors ${
              isCloudSynced
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                isCloudSynced
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
            >
              {isCloudSynced ? <Cloud className="w-4 h-4" /> : <Database className="w-4 h-4" />}
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  {isCloudSynced ? 'Baza w chmurze: AKTYWNA' : 'Baza w chmurze: PAMIĘĆ LOKALNA'}
                </span>
                {isCloudSynced && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <p className="mt-1 leading-relaxed opacity-90">
                {isCloudSynced
                  ? 'Wszystkie podłączone urządzenia członków komisji widzą i synchronizują te same głosy na żywo.'
                  : 'Głosy zapisują się w pamięci tego telefonu. Aby wszyscy widzieli te same wyniki przez internet, podłącz darmową bazę Upstash Redis w panelu Vercel (zakładka Storage → Redis).'}
              </p>
            </div>
          </div>

          {/* Download JSON */}
          <div className="p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                Pobierz kopię zapasową (JSON)
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Zapisz pełny stan głosów na dysku, aby w razie potrzeby przenieść na inny telefon lub komputer.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Zapisz JSON</span>
            </button>
          </div>

          {/* Export CSV for Excel */}
          <div className="p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                Eksport do Excel / Arkuszy (CSV)
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Pobierz tabelę kandydatów i liczbę głosów w formacie zgodnym z programem Microsoft Excel i Google Sheets.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Pobierz CSV</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                Przywróć dane z pliku
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Wgraj wcześniej zapisany plik kopii zapasowej .json.
              </p>
            </div>
            <label className="cursor-pointer w-full sm:w-auto px-3.5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors whitespace-nowrap">
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Wgraj plik</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          {/* Change Password Card */}
          <div className="p-3.5 sm:p-4 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-slate-900 dark:text-zinc-100 font-bold text-sm">
              <KeyRound className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Zmień hasło dostępu do panelu</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Ustaw nowe własne hasło dla komisji liczącej głosy.
            </p>
            <form onSubmit={handleSavePassword} className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
              <input
                type="password"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Wpisz nowe hasło..."
                className="w-full sm:flex-1 px-3.5 py-2 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-0"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition-all active:scale-95 shrink-0 shadow-sm shadow-blue-500/20 whitespace-nowrap flex items-center justify-center"
              >
                Zapisz hasło
              </button>
            </form>
          </div>

          {/* Danger zone: Reset */}
          <div className="p-3.5 sm:p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 mt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Strefa niebezpieczna: Resetowanie bazy</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Ta operacja wyzeruje wszystkie głosy i listę nauczycieli. Aby potwierdzić, wpisz poniżej słowo <strong className="text-red-600 dark:text-red-400">RESET</strong>:
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
              <input
                type="text"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                placeholder="Wpisz RESET..."
                className="w-full sm:flex-1 px-3.5 py-2 bg-white dark:bg-zinc-950 border border-red-300 dark:border-red-900/60 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white uppercase focus:outline-none focus:border-red-500 min-w-0"
              />
              <button
                onClick={handleResetSubmit}
                disabled={resetConfirmInput.trim().toUpperCase() !== 'RESET'}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Wyzeruj wszystko</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
