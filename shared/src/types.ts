export interface User {
  id: string;
  collegeId: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  teamName: string;
  members: Member[];
  collegeId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isDisqualified: boolean;
}

export interface Member {
  id: string;
  teamId: string;
  name: string;
  createdAt: Date;
}

export interface GameSession {
  id: string;
  status: 'pending' | 'in-progress' | 'paused' | 'completed';
  round: 'preliminary' | 'finals';
  currentQuestionIndex: number;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  gameSessionId: string;
  questionIndex: number;
  type: 'START' | 'CONTAIN';
  characters: string;
  timeLimit: number; // in seconds
  createdAt: Date;
}

export interface Answer {
  id: string;
  questionId: string;
  teamId: string;
  word: string;
  score: number;
  isValid: boolean;
  validationMessage?: string;
  submittedAt: Date;
  createdAt: Date;
}

export interface GameScore {
  id: string;
  gameSessionId: string;
  teamId: string;
  totalScore: number;
  questionScores: Record<string, number>;
  rank: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Leaderboard {
  gameSessionId: string;
  standings: LeaderboardEntry[];
  updatedAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  score: number;
  timeTaken: number; // in seconds
  isQualifiedForFinals?: boolean;
}

export interface SubmissionPayload {
  questionId: string;
  word: string;
  timeTaken: number;
}

export interface ScoreBreakdown {
  word: string;
  letters: { letter: string; value: number }[];
  totalScore: number;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'super-admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface GameConfig {
  preliminaryTeamsPerRound: number;
  finalistCount: number;
  questionsPerRound: number;
  startQuestionTime: number; // seconds
  containQuestionTime: number; // seconds
}

export interface SocketMessage {
  type: string;
  payload?: any;
  timestamp: Date;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
