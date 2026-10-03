'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  CategoryId,
  VotesData,
  TeacherVote,
  HistoryAction,
} from '@/lib/types';
import {
  CATEGORIES,
  INITIAL_VOTES_DATA,
  STORAGE_KEY_VOTES,
  STORAGE_KEY_CUSTOM_TEACHERS,
} from '@/lib/constants';
import Navbar from '@/components/Navbar';
import CategoryTabs from '@/components/CategoryTabs';
import CategoryCard from '@/components/CategoryCard';
import OfficialProtocolModal from '@/components/OfficialProtocolModal';
import BackupModal from '@/components/BackupModal';
import LoginScreen from '@/components/LoginScreen';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('organizator_rysi_2026');
  const [votesData, setVotesData] = useState<VotesData>(INITIAL_VOTES_DATA);
  const [selectedTab, setSelectedTab] = useState<CategoryId | 'all'>('all');
  const [historyStack, setHistoryStack] = useState<HistoryAction[]>([]);
  const [allKnownTeacherNames, setAllKnownTeacherNames] = useState<string[]>([]);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const lastKnownCloudTimestampRef = useRef<number>(0);
  const isPushingRef = useRef<boolean>(false);

  // Modals state
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // 1. Initial Authentication and Data loading
  useEffect(() => {
    // Initialize Theme
    const storedTheme = (localStorage.getItem('rysie_theme') as 'dark' | 'light') || 'dark';
    setTheme(storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check local session
    const storedSession = sessionStorage.getItem('rysie_session');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed?.user) {
          setIsAuthenticated(true);
          setCurrentUser(parsed.user);
        }
      } catch {
        // ignore
      }
    }

    // Verify session with server API
    fetch('/api/auth/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem('rysie_session');
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        if (!storedSession) setIsAuthenticated(false);
      });

    // Load persisted votes from localStorage
    const savedVotes = localStorage.getItem(STORAGE_KEY_VOTES);
    const savedTimestamp = Number(localStorage.getItem('rysie_votes_last_updated') || 0);
    lastKnownCloudTimestampRef.current = savedTimestamp;

    if (savedVotes) {
      try {
        const parsed = JSON.parse(savedVotes);
        // Ensure all categories exist
        const merged: VotesData = { ...INITIAL_VOTES_DATA };
        CATEGORIES.forEach((cat) => {
          merged[cat.id] = parsed[cat.id] || [];
        });
        setVotesData(merged);
      } catch (e) {
        console.error('Error loading saved votes', e);
      }
    }

    // Load teacher suggestions registry
    const savedNames = localStorage.getItem(STORAGE_KEY_CUSTOM_TEACHERS);
    if (savedNames) {
      try {
        setAllKnownTeacherNames(JSON.parse(savedNames));
      } catch {
        // ignore
      }
    }
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

  // Pull latest votes from cloud database
  const pullLatestFromCloud = useCallback(async () => {
    if (isPushingRef.current) return;
    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      if (res.status === 401) {
        sessionStorage.removeItem('rysie_session');
        setIsAuthenticated(false);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      setIsCloudSynced(Boolean(data?.cloudSync));

      if (data?.votes && typeof data?.lastUpdated === 'number') {
        const cloudIsNewer = data.lastUpdated > lastKnownCloudTimestampRef.current;
        const localIsEmpty = Object.values(votesData).flat().length === 0;

        if (cloudIsNewer || localIsEmpty) {
          lastKnownCloudTimestampRef.current = data.lastUpdated;
          setVotesData(data.votes);
          try {
            localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(data.votes));
            localStorage.setItem('rysie_votes_last_updated', String(data.lastUpdated));
          } catch {}

          // Merge teacher suggestions
          const cloudTeachers = Object.values(data.votes as VotesData)
            .flat()
            .map((t) => t?.name)
            .filter(Boolean);
          if (cloudTeachers.length > 0) {
            setAllKnownTeacherNames((prev) => {
              const combined = Array.from(new Set([...prev, ...cloudTeachers])).sort((a, b) =>
                a.localeCompare(b, 'pl')
              );
              try {
                localStorage.setItem(STORAGE_KEY_CUSTOM_TEACHERS, JSON.stringify(combined));
              } catch {}
              return combined;
            });
          }
        }
      }
    } catch {
      // silent network fallback
    }
  }, [votesData]);

  // Real-time synchronization loop across all devices
  useEffect(() => {
    if (!isAuthenticated) return;

    pullLatestFromCloud();

    const interval = setInterval(() => {
      pullLatestFromCloud();
    }, 3000);

    const onFocus = () => pullLatestFromCloud();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthenticated, pullLatestFromCloud]);

  // Save changes to localStorage & trigger background cloud sync
  const persistVotes = useCallback((newData: VotesData) => {
    const now = Date.now();
    lastKnownCloudTimestampRef.current = now;
    setVotesData(newData);
    try {
      localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(newData));
      localStorage.setItem('rysie_votes_last_updated', String(now));
    } catch (e) {
      console.error('Failed to persist votes locally', e);
    }

    isPushingRef.current = true;
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ votes: newData }),
    })
      .then((res) => res.json())
      .then((resp) => {
        if (resp?.cloudSync) setIsCloudSynced(true);
        if (typeof resp?.lastUpdated === 'number') {
          lastKnownCloudTimestampRef.current = Math.max(lastKnownCloudTimestampRef.current, resp.lastUpdated);
        }
      })
      .catch((err) => {
        console.error('Failed to sync to cloud', err);
      })
      .finally(() => {
        isPushingRef.current = false;
      });
  }, []);

  // Registry update helper
  const registerTeacherName = useCallback((name: string) => {
    setAllKnownTeacherNames((prev) => {
      if (!prev.includes(name)) {
        const updated = [...prev, name].sort((a, b) => a.localeCompare(b, 'pl'));
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

    const currentList = votesData[categoryId] || [];
    const updated = {
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
    const currentList = votesData[categoryId] || [];
    const teacher = currentList.find((t) => t.id === teacherId);
    if (!teacher) return;

    const previousVotes = teacher.votes;
    const newVotes = previousVotes + delta;

    const updatedList = currentList.map((t) =>
      t.id === teacherId ? { ...t, votes: newVotes, updatedAt: Date.now() } : t
    );

    const updatedData = {
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
    const currentList = votesData[categoryId] || [];
    const teacher = currentList.find((t) => t.id === teacherId);
    if (!teacher || teacher.votes <= 0) return;

    const previousVotes = teacher.votes;
    const newVotes = Math.max(0, previousVotes - 1);

    const updatedList = currentList.map((t) =>
      t.id === teacherId ? { ...t, votes: newVotes, updatedAt: Date.now() } : t
    );

    const updatedData = {
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
    const currentList = votesData[categoryId] || [];
    const updatedList = currentList.filter((t) => t.id !== teacherId);

    const updatedData = {
      ...votesData,
      [categoryId]: updatedList,
    };

    persistVotes(updatedData);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;

    const lastAction = historyStack[historyStack.length - 1];
    const categoryList = votesData[lastAction.categoryId] || [];

    const updatedList = categoryList.map((t) =>
      t.id === lastAction.teacherId
        ? { ...t, votes: lastAction.previousVotes, updatedAt: Date.now() }
        : t
    );

    const updatedData = {
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
    const sanitized: VotesData = { ...INITIAL_VOTES_DATA };
    CATEGORIES.forEach((cat) => {
      sanitized[cat.id] = Array.isArray(restored[cat.id]) ? restored[cat.id] : [];
    });
    persistVotes(sanitized);

    const names = Object.values(sanitized)
      .flat()
      .map((t) => t.name);
    const unique = Array.from(new Set(names));
    setAllKnownTeacherNames(unique);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_TEACHERS, JSON.stringify(unique));
    } catch {}
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('rysie_session');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setIsAuthenticated(false);
  };

  // Calculations for UI statistics
  const totalVotes = useMemo(() => {
    return Object.values(votesData)
      .flat()
      .reduce((sum, t) => sum + (t?.votes || 0), 0);
  }, [votesData]);

  const totalTeachers = useMemo(() => {
    return Object.values(votesData).flat().length;
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
        isCloudSynced={isCloudSynced}
      />

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
        isCloudSynced={isCloudSynced}
      />
    </div>
  );
}
