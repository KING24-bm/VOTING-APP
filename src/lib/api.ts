import { supabase } from './supabase';
import { Poll, Candidate, Vote, User, PollWithCandidates, ApiResponse, VerificationResult, Student, VoterTokenResponse } from '../types';

export const generateBrowserFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.fillText(navigator.userAgent, 2, 2);
  const canvasHash = canvas.toDataURL();

  const fingerprint = btoa(
    unescape(encodeURIComponent(
      navigator.userAgent +
      canvasHash +
      screen.width +
      screen.height +
      Date.now()
    ))
  );
  return fingerprint;
};

export const verifyStudent = async (
  studentId: string,
  classId: string,
  isTestMode: boolean = false
): Promise<VerificationResult> => {
  try {
    const table = isTestMode ? 'test_students' : 'students';
    const upperStudentId = studentId.trim().toUpperCase();
    const upperClassId = classId.trim().toUpperCase();
    
    console.log(`Verifying: table=${table}, student_id=${upperStudentId}, class_id=${upperClassId}, testMode=${isTestMode}`);
    
    const { data: student, error } = await supabase
      .from(table)
      .select('id, student_id, name, class_id')
      .eq('student_id', upperStudentId)
      .eq('class_id', upperClassId)
      .maybeSingle();

    if (error) {
      console.error(`Supabase error (${error.code}):`, error.message);
      if (error.code === 'PGRST116') { // No rows returned
        return {
          isValid: false,
          error: isTestMode ? 'No student found in test_students table' : 'No student found in students table'
        };
      }
      if (error.code === 'PGRST301') { // Table doesn't exist 404
        return {
          isValid: false,
          error: `Table ${table} not found. Run migrations on Supabase: cd VOTING-APP-main/supabase && supabase db push`
        };
      }
      return {
        isValid: false,
        error: `Database error: ${error.message}`
      };
    }

    // Check if doesn't exist
    if (!student) {
      return {
        isValid: false,
        error: isTestMode ? 'No student found in test_students' : 'No student found in students'
      };
    }

    console.log('Student verified:', student);
    return {
      isValid: true,
      student: student as Student
    };
  } catch (error: any) {
    console.error('Verification exception:', error);
    return {
      isValid: false,
      error: 'Verification service unavailable'
    };
  }
};

export const generateSecureVoterToken = async (studentId: string): Promise<VoterTokenResponse> => {
  const fingerprint = generateBrowserFingerprint();
  const timestamp = Date.now().toString();
  const random = crypto.randomUUID();

  // Simple client-side hash (for demo; production: Edge Function)
  const encoder = new TextEncoder();
  const data = encoder.encode(studentId + fingerprint + timestamp + random);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const token = `voter_${hash.slice(0, 32)}`;

  // Store token mapping (secure storage - production: Supabase table with expiry)
  sessionStorage.setItem('voterToken', token);

  return { token };
};


class ApiService {
  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (!user) {
        return { data: null, error: 'No user found', success: false };
      }
      
      // Fetch user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // Try student table as fallback
        const { data: studentProfile, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (studentError) {
          return { data: null, error: 'User profile not found', success: false };
        }
        
        return { 
          data: { 
            id: studentProfile.id, 
            email: user.email!, 
            role: 'student',
            name: studentProfile.name
          }, 
          success: true 
        };
      }
      
      return { 
        data: { 
          id: profile.id, 
          email: user.email!, 
          role: 'teacher',
          name: profile.name
        }, 
        success: true 
      };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  async getActivePolls(): Promise<ApiResponse<Poll[]>> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .gte('starts_at', new Date().toISOString())
        .lte('ends_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], success: true };
    } catch (error: any) {
      return { data: [], error: error.message, success: false };
    }
  }

  async getPollById(pollId: string): Promise<ApiResponse<PollWithCandidates>> {
    try {
      // Get poll details
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;

      // Get candidates for this poll
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('poll_id', pollId);

      if (candidatesError) throw candidatesError;

      return { 
        data: { ...poll, candidates: candidates || [] }, 
        success: true 
      };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  async submitVote(voteData: any): Promise<ApiResponse<Vote>> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .insert([{
          ...voteData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  async createPoll(pollData: Omit<Poll, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<ApiResponse<Poll>> {
    try {
      const { data, error } = await supabase
        .from('polls')
        .insert([{
          ...pollData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error: any) {
      return { data: null, error: error.message, success: false };
    }
  }

  async getResults(pollId: string): Promise<ApiResponse<Candidate[]>> {
    try {
      const { data: candidates, error } = await supabase
        .from('candidates')
        .select(`
          *,
          votes(count)
        `)
        .eq('poll_id', pollId);

      if (error) throw error;

      // Calculate vote counts
      const candidatesWithVotes = candidates.map(candidate => ({
        ...candidate,
        vote_count: candidate.votes?.[0]?.count || 0
      }));

      return { data: candidatesWithVotes, success: true };
    } catch (error: any) {
      return { data: [], error: error.message, success: false };
    }
  }
}

export const apiService = new ApiService();

