'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { STORAGE_KEY_SYNC_MODE } from '@/lib/constants';
import { AlertTriangle, RefreshCw, HardDrive, CheckCircle2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  switchedToLocal: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      switchedToLocal: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      switchedToLocal: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleForceLocalAndReload = () => {
    try {
      localStorage.setItem(STORAGE_KEY_SYNC_MODE, 'local');
      this.setState({ switchedToLocal: true });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      window.location.reload();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-black text-white">
              Wystąpił problem z wyświetlaniem
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Nie martw się – Twoje dotychczasowe głosy są bezpiecznie zapisane w pamięci przeglądarki na tym urządzeniu.
            </p>

            {this.state.switchedToLocal ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Przełączono na tryb lokalny. Przeładowywanie...</span>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <button
                  onClick={this.handleForceLocalAndReload}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <HardDrive className="w-4 h-4 shrink-0" />
                  <span>Uruchom w bezpiecznym trybie lokalnym</span>
                </button>

                <button
                  onClick={this.handleReload}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  <span>Odśwież stronę</span>
                </button>
              </div>
            )}

            {this.state.error && (
              <details className="text-left text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-700/60 mt-4 overflow-hidden">
                <summary className="cursor-pointer text-slate-400 hover:text-slate-200 font-mono">
                  Szczegóły techniczne błędu
                </summary>
                <p className="font-mono text-red-400 mt-2 break-all">
                  {this.state.error.toString()}
                </p>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
