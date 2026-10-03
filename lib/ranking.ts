import { RankedTeacher, TeacherVote } from './types';

export function calculateRankings(teachers: TeacherVote[]): RankedTeacher[] {
  if (!teachers || teachers.length === 0) return [];

  // Sort by votes descending, then alphabetically by name
  const sorted = [...teachers].sort((a, b) => {
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }
    return a.name.localeCompare(b.name, 'pl', { sensitivity: 'base' });
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
  const ranked = calculateRankings(teachers);
  const winners = ranked.filter((t) => t.status === 'winner');
  if (winners.length === 0) return null;
  return {
    leaderName: winners.map((w) => w.name).join(', '),
    maxVotes: winners[0].votes,
  };
}
