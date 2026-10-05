'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  CategoryId,
  VotesData,
  TeacherVote,
  HistoryAction,
  SyncMode,
} from '@/lib/types';
import {
  CATEGORIES,
  INITIAL_VOTES_DATA,
  STORAGE_KEY_VOTES,
  STORAGE_KEY_CUSTOM_TEACHERS,
  STORAGE_KEY_SYNC_MODE,
  DEFAULT_TEACHER_NAMES,
} from '@/lib/constants';
import Navbar from '@/components/Navbar';
import CategoryTabs from '@/components/CategoryTabs';
import CategoryCard from '@/components/CategoryCard';
import OfficialProtocolModal from '@/components/OfficialProtocolModal';
import BackupModal from '@/components/BackupModal';
import ModeSwitchModal from '@/components/ModeSwitchModal';
import LoginScreen from '@/components/LoginScreen';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AlertTriangle, HardDrive, RefreshCw } from 'lucide-react';

function sanitizeVotes(raw: any): VotesData {
  const result: VotesData = { ...INITIAL_VOTES_DATA };
  if (!raw || typeof raw !== 'object') return result;

  CATEGORIES.forEach((cat) => {
    const list = raw[cat.id];
    if (Array.isArray(list)) {
      result[cat.id] = list
        .filter((t) => t && typeof t === 'object' && typeof t.name === 'string' && t.name.trim().length > 0)
        .map((t) => ({
          id: String(t.id || `${cat.id}-${Math.random().toString(36).slice(2)}`),
          name: String(t.name).trim(),
          votes: typeof t.votes === 'number' && !isNaN(t.votes) && t.votes >= 0 ? Math.floor(t.votes) : 0,
          updatedAt: typeof t.updatedAt === 'number' ? t.updatedAt : Date.now(),
        }));
    } else {
      result[cat.id] = [];
    }
  });

  return result;
}

function countTotalVotes(data: VotesData): number {
  if (!data || typeof data !== 'object') return 0;
  return Object.values(data)
    .flat()
    .reduce((sum, t) => sum + (Number(t?.votes) || 0), 0);
}

export default function HomePage() {
  return (
    <ErrorBoundary>
      <MainVotingApp />
    </ErrorBoundary>
  );
}

function MainVotingApp() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('organizator');
  const [votesData, setVotesData] = useState<VotesData>(INITIAL_VOTES_DATA);
  const [selectedTab, setSelectedTab] = useState<CategoryId | 'all'>('all');
  const [historyStack, setHistoryStack] = useState<HistoryAction[]>([]);
  const [allKnownTeacherNames, setAllKnownTeacherNames] = useState<string[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Sync mode: 'live' or 'local'
  const [syncMode, setSyncMode] = useState<SyncMode>('live');
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [showFailureBanner, setShowFailureBanner] = useState<boolean>(true);

  // Modals state
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isModeSwitchModalOpen, setIsModeSwitchModalOpen] = useState(false);

  // References to prevent stale closures and polling races
  const lastKnownCloudTimestampRef = useRef<number>(0);
  const isPushingRef = useRef<boolean>(false);
  const votesDataRef = useRef<VotesData>(INITIAL_VOTES_DATA);
  votesDataRef.current = votesData;
  const syncModeRef = useRef<SyncMode>('live');
  syncModeRef.current = syncMode;
  const failureCountRef = useRef<number>(0);

  // 1. Initial Load: Theme, Auth, LocalStorage, and Mode
  useEffect(() => {
    // Theme
    const storedTheme = (localStorage.getItem('rysie_theme') as 'dark' | 'light') || 'dark';
    setTheme(storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Sync Mode
    const savedMode = (localStorage.getItem(STORAGE_KEY_SYNC_MODE) as SyncMode) || 'live';
    setSyncMode(savedMode);
    syncModeRef.current = savedMode;

    // Local Session
    const storedSession = localStorage.getItem('rysie_session') || sessionStorage.getItem('rysie_session');
    let hasLocalSession = false;
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed?.user) {
          setIsAuthenticated(true);
          setCurrentUser(parsed.user);
          hasLocalSession = true;
        }
      } catch {
        // ignore
      }
    }

    // Check with server
    fetch('/api/auth/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          if (data.user) setCurrentUser(data.user);
        } else if (!hasLocalSession) {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        if (!hasLocalSession) setIsAuthenticated(false);
      });

    // Load persisted votes from localStorage
    const savedVotes = localStorage.getItem(STORAGE_KEY_VOTES);
    const savedTimestamp = Number(localStorage.getItem('rysie_votes_last_updated') || 0);
    lastKnownCloudTimestampRef.current = savedTimestamp;

    if (savedVotes) {
      try {
        const parsed = JSON.parse(savedVotes);
        const sanitized = sanitizeVotes(parsed);
        setVotesData(sanitized);
        votesDataRef.current = sanitized;
      } catch (e) {
        console.error('Błąd odczytu zapisanych głosów z localStorage', e);
      }
    }

    // Teacher suggestions registry
    const savedNames = localStorage.getItem(STORAGE_KEY_CUSTOM_TEACHERS);
    let initialNames = [...DEFAULT_TEACHER_NAMES];
    if (savedNames) {
      try {
        const parsed = JSON.parse(savedNames);
        if (Array.isArray(parsed)) {
          initialNames = Array.from(new Set([...initialNames, ...parsed]));
        }
      } catch {
        // ignore
      }
    }
    setAllKnownTeacherNames(initialNames.sort((a, b) => a.localeCompare(b, 'pl')));
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('rysie_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  };

  // Push votes to cloud database (used in live mode or manual push)
  const pushVotesToCloud = useCallback(async (dataToPush: VotesData, customTimestamp?: number) => {
    if (isPushingRef.current) return;
    isPushingRef.current = true;

    const timestamp = customTimestamp || Date.now();
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votes: dataToPush }),
        keepalive: true,
      });

      const resp = await res.json();
      if (resp?.cloudSync) {
        setIsCloudSynced(true);
        setCloudError(null);
        failureCountRef.current = 0;
        if (typeof resp.lastUpdated === 'number') {
          lastKnownCloudTimestampRef.current = Math.max(lastKnownCloudTimestampRef.current, resp.lastUpdated);
        }
      } else if (resp?.error) {
        setCloudError(resp.error);
      }
    } catch (err: any) {
      console.warn('Nie udało się wysłać danych do chmury:', err);
      failureCountRef.current += 1;
      if (failureCountRef.current >= 3) {
        setCloudError('Brak połączenia z chmurą. Dane są bezpieczne lokalnie.');
      }
    } finally {
      isPushingRef.current = false;
    }
  }, []);

  // Pull latest votes from cloud database
  const pullLatestFromCloud = useCallback(async (force: boolean = false) => {
    // If in local mode, never touch cloud
    if (syncModeRef.current === 'local' && !force) return;
    if (isPushingRef.current) return;

    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      if (!res.ok) {
        failureCountRef.current += 1;
        if (failureCountRef.current >= 3) {
          setCloudError(`Błąd serwera (${res.status})`);
        }
        return;
      }

      const data = await res.json();

      if (!data.configured) {
        // Cloud database is not configured in Vercel
        setIsCloudSynced(false);
        return;
      }

      setIsCloudSynced(Boolean(data.cloudSync));
      setCloudError(null);
      failureCountRef.current = 0;

      // Handle brand new database: if cloud is empty but we have local votes, seed cloud!
      if (data.isEmpty) {
        const localVotes = countTotalVotes(votesDataRef.current);
        if (localVotes > 0) {
          pushVotesToCloud(votesDataRef.current);
        }
        return;
      }

      if (data.votes && typeof data.votes === 'object') {
        const cloudVotes = sanitizeVotes(data.votes);
        const cloudTimestamp = typeof data.lastUpdated === 'number' ? data.lastUpdated : 0;

        const currentLocalVotes = countTotalVotes(votesDataRef.current);
        const cloudTotalVotes = countTotalVotes(cloudVotes);

        // ANTI-DATA-LOSS SHIELD: Never overwrite non-empty local votes with empty cloud votes!
        if (currentLocalVotes > 0 && cloudTotalVotes === 0) {
          console.warn('Ochrona danych: zablokowano nadpisanie policzonych głosów pustą odpowiedzią z chmury.');
          pushVotesToCloud(votesDataRef.current);
          return;
        }

        const cloudIsNewer = cloudTimestamp > lastKnownCloudTimestampRef.current;
        if (cloudIsNewer || (cloudTotalVotes > 0 && currentLocalVotes === 0) || force) {
          lastKnownCloudTimestampRef.current = cloudTimestamp;
          setVotesData(cloudVotes);
          votesDataRef.current = cloudVotes;

          try {
            localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(cloudVotes));
            localStorage.setItem('rysie_votes_last_updated', String(cloudTimestamp));
          } catch {}

          // Merge teacher suggestions
          const cloudTeachers = Object.values(cloudVotes)
            .flat()
            .map((t) => t?.name)
            .filter(Boolean) as string[];

          setAllKnownTeacherNames((prev) => {
            const combined = Array.from(
              new Set([...DEFAULT_TEACHER_NAMES, ...prev, ...cloudTeachers])
            ).sort((a, b) => a.localeCompare(b, 'pl'));
            try {
              localStorage.setItem(STORAGE_KEY_CUSTOM_TEACHERS, JSON.stringify(combined));
            } catch {}
            return combined;
          });
        }
      }
    } catch {
      failureCountRef.current += 1;
      if (failureCountRef.current >= 3) {
        setCloudError('Problem z połączeniem z bazą w chmurze.');
      }
    }
  }, [pushVotesToCloud]);

  // Real-time synchronization loop (ONLY runs when in 'live' mode and page is visible)
  useEffect(() => {
    if (!isAuthenticated) return;
    if (syncMode !== 'live') return;

    // Initial pull
    pullLatestFromCloud();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      pullLatestFromCloud();
    }, 5000);

    const onFocus = () => pullLatestFromCloud();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthenticated, syncMode, pullLatestFromCloud]);

  // Switch mode handler (Live <-> Local)
  const handleSwitchMode = (newMode: SyncMode, pushLocalToCloud: boolean = true) => {
    setSyncMode(newMode);
    syncModeRef.current = newMode;
    try {
      localStorage.setItem(STORAGE_KEY_SYNC_MODE, newMode);
    } catch {}

    if (newMode === 'local') {
      setIsCloudSynced(false);
      setCloudError(null);
    } else {
      // Switched to live
      if (pushLocalToCloud && countTotalVotes(votesDataRef.current) > 0) {
        pushVotesToCloud(votesDataRef.current, Date.now());
      } else {
        pullLatestFromCloud(true);
      }
    }
  };

  // Save changes locally and conditionally sync to cloud
  const persistVotes = useCallback((newData: VotesData) => {
    const sanitized = sanitizeVotes(newData);
    const now = Date.now();
    lastKnownCloudTimestampRef.current = now;
    setVotesData(sanitized);
    votesDataRef.current = sanitized;

    try {
      localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(sanitized));
      localStorage.setItem('rysie_votes_last_updated', String(now));
    } catch (e) {
      console.error('Nie udało się zapisać głosów lokalnie', e);
    }

    // In local mode, DO NOT send anything to cloud! 100% offline & safe.
    if (syncModeRef.current === 'local') {
      return;
    }

    pushVotesToCloud(sanitized, now);
  }, [pushVotesToCloud]);

  // Registry update helper
  const registerTeacherName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAllKnownTeacherNames((prev) => {
      if (!prev.includes(trimmed)) {
        const updated = [...prev, trimmed].sort((a, b) => a.localeCompare(b, 'pl'));
        try {
          localStorage.setItem(STORAGE_KEY_CUSTOM_TEACHERS, JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prev;
    });
  }, []);

  // Handlers for Teacher Votes
  const handleAddTeacher = (categoryId: CategoryId, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    registerTeacherName(trimmed);

    const newTeacher: TeacherVote = {
      id: `${categoryId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: trimmed,
      votes: 0,
      updatedAt: Date.now(),
    };

    const currentList = Array.isArray(votesData[categoryId]) ? votesData[categoryId] : [];
    const updated: VotesData = {
      ...votesData,
      [categoryId]: [...currentList, newTeacher],
    };

    persistVotes(updated);
  };

  const handleIncrementVote = (
    categoryId: CategoryId,
    teacherId: string,
    delta: number = 1
  ) => {
    const currentList = Array.isArray(votesData[categoryId]) ? votesData[categoryId] : [];
    const teacher = currentList.find((t) => t?.id === teacherId);
    if (!teacher) return;

    const previousVotes = Number(teacher.votes) || 0;
    const newVotes = previousVotes + delta;

    const updatedList = currentList.map((t) =>
      t.id === teacherId ? { ...t, votes: newVotes, updatedAt: Date.now() } : t
    );

    const updatedData: VotesData = {
      ...votesData,
      [categoryId]: updatedList,
    };

    // Push to undo stack
    setHistoryStack((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        categoryId,
        teacherId,
        teacherName: teacher.name,
        previousVotes,
        newVotes,
        timestamp: Date.now(),
      },
    ]);

    persistVotes(updatedData);
  };

  const handleDecrementVote = (categoryId: CategoryId, teacherId: string) => {
    const currentList = Array.isArray(votesData[categoryId]) ? votesData[categoryId] : [];
    const teacher = currentList.find((t) => t?.id === teacherId);
    if (!teacher || (Number(teacher.votes) || 0) <= 0) return;

    const previousVotes = Number(teacher.votes) || 0;
    const newVotes = Math.max(0, previousVotes - 1);

    const updatedList = currentList.map((t) =>
      t.id === teacherId ? { ...t, votes: newVotes, updatedAt: Date.now() } : t
    );

    const updatedData: VotesData = {
      ...votesData,
      [categoryId]: updatedList,
    };

    // Push to undo stack
    setHistoryStack((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        categoryId,
        teacherId,
        teacherName: teacher.name,
        previousVotes,
        newVotes,
        timestamp: Date.now(),
      },
    ]);

    persistVotes(updatedData);
  };

  const handleDeleteTeacher = (categoryId: CategoryId, teacherId: string) => {
    const currentList = Array.isArray(votesData[categoryId]) ? votesData[categoryId] : [];
    const updatedList = currentList.filter((t) => t?.id !== teacherId);

    const updatedData: VotesData = {
      ...votesData,
      [categoryId]: updatedList,
    };

    persistVotes(updatedData);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;

    const lastAction = historyStack[historyStack.length - 1];
    const categoryList = Array.isArray(votesData[lastAction.categoryId]) ? votesData[lastAction.categoryId] : [];

    const updatedList = categoryList.map((t) =>
      t.id === lastAction.teacherId
        ? { ...t, votes: lastAction.previousVotes, updatedAt: Date.now() }
        : t
    );

    const updatedData: VotesData = {
      ...votesData,
      [lastAction.categoryId]: updatedList,
    };

    persistVotes(updatedData);
    setHistoryStack((prev) => prev.slice(0, -1));
  };

  const handleResetAllData = () => {
    persistVotes(INITIAL_VOTES_DATA);
    setHistoryStack([]);
  };

  const handleRestoreData = (restored: VotesData) => {
    const sanitized = sanitizeVotes(restored);
    persistVotes(sanitized);

    const names = Object.values(sanitized)
      .flat()
      .map((t) => t?.name)
      .filter(Boolean) as string[];
    const unique = Array.from(new Set(names));
    setAllKnownTeacherNames(unique);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_TEACHERS, JSON.stringify(unique));
    } catch {}
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('rysie_session');
    localStorage.removeItem('rysie_session');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setIsAuthenticated(false);
  };

  // Calculations for UI statistics
  const totalVotes = useMemo(() => countTotalVotes(votesData), [votesData]);

  const totalTeachers = useMemo(() => {
    return Object.values(votesData).flat().filter(Boolean).length;
  }, [votesData]);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-amber-500 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-zinc-400 text-sm font-medium">Ładowanie panelu Rysie 2026...</p>
        </div>
      </div>
    );
  }

  // Login view
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // Categories to display
  const displayedCategories =
    selectedTab === 'all'
      ? CATEGORIES
      : CATEGORIES.filter((c) => c.id === selectedTab);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        totalVotes={totalVotes}
        totalTeachers={totalTeachers}
        canUndo={historyStack.length > 0}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onUndo={handleUndo}
        onOpenProtocol={() => setIsProtocolModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onLogout={handleLogout}
        syncMode={syncMode}
        isCloudSynced={isCloudSynced}
        cloudError={cloudError}
        onOpenModeSwitch={() => setIsModeSwitchModalOpen(true)}
      />

      {/* Cloud issue alert banner: shown when live is failing */}
      {syncMode === 'live' && cloudError && showFailureBanner && (
        <div className="bg-amber-500/15 dark:bg-amber-500/20 border-b border-amber-500/30 px-3 sm:px-6 py-2.5 text-xs text-amber-950 dark:text-amber-200 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="truncate">
                <strong>Baza na żywo ma problem:</strong> {cloudError} Twoje głosy są bezpieczne na tym telefonie.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleSwitchMode('local')}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Włącz tryb lokalny</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFailureBanner(false)}
                className="p-1 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category selector tabs bar */}
      <CategoryTabs
        selectedTab={selectedTab}
        onSelectTab={(tab) => {
          setSelectedTab(tab);
          if (tab !== 'all') {
            const el = document.getElementById(`cat-${tab}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }}
        votesData={votesData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* 6 Categories Grid */}
        <div
          className={`grid gap-6 ${
            selectedTab === 'all'
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
              : 'grid-cols-1 max-w-2xl mx-auto'
          }`}
        >
          {displayedCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              teachers={votesData[category.id] || []}
              allKnownTeacherNames={allKnownTeacherNames}
              onAddTeacher={handleAddTeacher}
              onIncrementVote={handleIncrementVote}
              onDecrementVote={handleDecrementVote}
              onDeleteTeacher={handleDeleteTeacher}
            />
          ))}
        </div>
      </main>

      {/* Modals */}
      <OfficialProtocolModal
        isOpen={isProtocolModalOpen}
        onClose={() => setIsProtocolModalOpen(false)}
        votesData={votesData}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        votesData={votesData}
        onRestoreData={handleRestoreData}
        onResetAllData={handleResetAllData}
        syncMode={syncMode}
        isCloudSynced={isCloudSynced}
        cloudError={cloudError}
        onSwitchMode={handleSwitchMode}
        onForcePushCloud={() => pushVotesToCloud(votesDataRef.current, Date.now())}
        onForcePullCloud={() => pullLatestFromCloud(true)}
      />

      <ModeSwitchModal
        isOpen={isModeSwitchModalOpen}
        onClose={() => setIsModeSwitchModalOpen(false)}
        currentMode={syncMode}
        onSwitchMode={handleSwitchMode}
        isCloudConnected={isCloudSynced}
        localVotesCount={totalVotes}
      />
    </div>
  );
}
