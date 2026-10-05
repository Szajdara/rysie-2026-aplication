import { RankedTeacher, TeacherVote } from './types';

export function calculateRankings(teachers: TeacherVote[]): RankedTeacher[] {
  if (!Array.isArray(teachers) || teachers.length === 0) return [];

  // Filter and sanitize teachers to prevent any runtime exceptions
  const validTeachers: TeacherVote[] = teachers
    .filter((t): t is TeacherVote => Boolean(t && typeof t === 'object' && typeof t.name === 'string'))
    .map((t) => ({
      id: String(t.id || Math.random().toString(36).slice(2)),
      name: String(t.name).trim(),
      votes: typeof t.votes === 'number' && !isNaN(t.votes) && t.votes >= 0 ? Math.floor(t.votes) : 0,
      updatedAt: typeof t.updatedAt === 'number' ? t.updatedAt : Date.now(),
    }));

  if (validTeachers.length === 0) return [];

  // Sort by votes descending, then alphabetically by name
  const sorted = [...validTeachers].sort((a, b) => {
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }
    return (a.name || '').localeCompare(b.name || '', 'pl', { sensitivity: 'base' });
  });

  // Calculate ranks
  // Only teachers with > 0 votes can qualify for Winner (gold) or Nominee (silver)
  let currentRank = 1;
  const result: RankedTeacher[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];

    if (i > 0 && item.votes < sorted[i - 1].votes) {
      currentRank = i + 1;
    }

    const isTied = sorted.filter((t) => t.votes === item.votes && t.votes > 0).length > 1;

    let status: RankedTeacher['status'] = 'none';

    if (item.votes > 0) {
      if (currentRank === 1) {
        status = 'winner';
      } else if (currentRank === 2 || currentRank === 3) {
        status = 'nominee';
      } else {
        status = 'participant';
      }
    }

    result.push({
      ...item,
      rank: item.votes > 0 ? currentRank : sorted.length,
      status,
      isTied: item.votes > 0 && isTied,
    });
  }

  return result;
}

export function getCategoryLeader(teachers: TeacherVote[]): { leaderName: string; maxVotes: number } | null {
  if (!Array.isArray(teachers) || teachers.length === 0) return null;
  const ranked = calculateRankings(teachers);
  const winners = ranked.filter((t) => t.status === 'winner');
  if (winners.length === 0) return null;
  return {
    leaderName: winners.map((w) => w.name).join(', '),
    maxVotes: winners[0].votes,
  };
}

// Correct Polish inflection for votes (1 głos, 2 głosy, 5 głosów, 13 głosów, 22 głosy, etc.)
export function formatVotesCount(votes: number): string {
  const safeVotes = typeof votes === 'number' && !isNaN(votes) ? Math.max(0, Math.floor(votes)) : 0;
  if (safeVotes === 1) return '1 głos';
  const lastDigit = safeVotes % 10;
  const lastTwoDigits = safeVotes % 100;
  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) {
    return `${safeVotes} głosów`;
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${safeVotes} głosy`;
  }
  return `${safeVotes} głosów`;
}

// Auto-capitalize teacher names (e.g. "justyna andrzejak" -> "Justyna Andrzejak")
export function formatTeacherName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .filter(Boolean)
    .join(' ');
}

