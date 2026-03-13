export interface User {
  id: string;
  email: string;
  role: 'teacher' | 'student';
  name?: string;
  created_at?: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  created_by: string;
  starts_at: string;
  ends_at: string;
  max_votes: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Candidate {
  id: string;
  poll_id: string;
  name: string;
  description: string;
  vote_count: number;
}

export interface Vote {
  id: string;
  role_id: string;
  candidate_id: string | null;
  voter_token: string;
  created_at: string;
}

export interface PollWithCandidates extends Poll {
  candidates: Candidate[];
}

export interface ApiResponse<T> {
  data?: T | null;
  error?: string;
  success: boolean;
}

export type { Student, VerificationResult, VoterTokenResponse } from './voting';

