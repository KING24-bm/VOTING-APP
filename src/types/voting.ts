export interface CaptchaChallenge {
  id: string;
  challenge: string; // Base64 encoded or encrypted question
  hint: string;
  expiresAt: number;
}

export interface Student {
  id: string;
  student_id: string;
  name: string;
  class_id: string;
  is_active?: boolean;
}

export interface VerificationResult {
  isValid: boolean;
  student?: Student;
  error?: string;
}

export interface VoterTokenResponse {
  token: string;
}

export interface BrowserFingerprint {
  hash: string;
}

export interface Vote {
  id: string;
  role_id: string;
  candidate_id: string | null;
  voter_token: string;
  created_at: string;
}

