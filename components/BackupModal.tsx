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
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  votesData: VotesData;
  onRestoreData: (restored: VotesData) => void;
  onResetAllData: () => void;
}

export default function BackupModal({
  isOpen,
  onClose,
  votesData,
  onRestoreData,
  onResetAllData,
}: BackupModalProps) {
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
            Kopia Zapasowa i Narzędzia
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs sm:text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action list */}
        <div className="mt-6 space-y-4">
          {/* Download JSON */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
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
              className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Download className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Zapisz JSON</span>
            </button>
          </div>

          {/* Export CSV for Excel */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
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
              className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Pobierz CSV</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                Przywróć dane z pliku
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Wgraj wcześniej zapisany plik kopii zapasowej .json.
              </p>
            </div>
            <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors">
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Wgraj plik</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          {/* Danger zone: Reset */}
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 mt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Strefa niebezpieczna: Resetowanie bazy</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Ta operacja wyzeruje wszystkie głosy i listę nauczycieli. Aby potwierdzić, wpisz poniżej słowo <strong className="text-red-600 dark:text-red-400">RESET</strong>:
            </p>

            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                placeholder="Wpisz RESET..."
                className="flex-1 px-3 py-2 bg-white dark:bg-zinc-950 border border-red-300 dark:border-red-900/60 rounded-xl text-xs text-slate-900 dark:text-white uppercase focus:outline-none focus:border-red-500"
              />
              <button
                onClick={handleResetSubmit}
                disabled={resetConfirmInput.trim().toUpperCase() !== 'RESET'}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Wyzeruj wszystko</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
