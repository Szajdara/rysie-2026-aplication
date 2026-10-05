export interface TeacherVote {
  id: string;
  name: string;
  votes: number;
  updatedAt: number;
}

export type CategoryId =
  | 'forrest-gump'
  | 'terminator'
  | 'sherlock-holmes'
  | 'darth-vader'
  | 'gandalf'
  | 'vito-corleone';

export interface CategoryDefinition {
  id: CategoryId;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  iconName: 'Zap' | 'Shield' | 'Search' | 'Flame' | 'Sparkles' | 'Crown';
  badgeColor: string;
}

export type VotesData = Record<CategoryId, TeacherVote[]>;

export interface HistoryAction {
  id: string;
  categoryId: CategoryId;
  teacherId: string;
  teacherName: string;
  previousVotes: number;
  newVotes: number;
  timestamp: number;
}

export type TeacherRankStatus = 'winner' | 'nominee' | 'participant' | 'none';

export interface RankedTeacher extends TeacherVote {
  rank: number;
  status: TeacherRankStatus;
  isTied: boolean;
}

export type SyncMode = 'live' | 'local';

