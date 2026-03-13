import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Poll {
  id: string;
  title: string;
  description: string;
  roles: Role[];
}

interface Role {
  id: string;
  name: string;
  candidates: Candidate[];
}

interface Candidate {
  id: string;
  name: string;
  image_url: string;
  logo_url: string;
}

export const useVotingSystem = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPollId, setSelectedPollId] = useState<string>('');
  const [votes, setVotes] = useState<Record<string, string | null>>({});
  const [submittedRoles, setSubmittedRoles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Get voter token from secure storage
  const voterToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('voterToken') || '' : '';

  useEffect(() => {
    if (!voterToken) {
      setError('No valid voting session found. Please verify your credentials again.');
      return;
    }
    
    fetchPolls();
  }, [voterToken]);

  const fetchPolls = async () => {
    setIsLoading(true);
    try {
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('id, title, description')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      if (pollsData && pollsData.length > 0) {
        const pollsWithRoles = await Promise.all(
          pollsData.map(async (poll) => {
            const { data: roles, error: rolesError } = await supabase
              .from('roles')
              .select('id, name')
              .eq('poll_id', poll.id);

            if (rolesError) throw rolesError;

            const rolesWithCandidates = await Promise.all(
              (roles || []).map(async (role) => {
                const { data: candidates, error: candidatesError } = await supabase
                  .from('candidates')
                  .select('id, name, image_url, logo_url')
                  .eq('role_id', role.id);

                if (candidatesError) throw candidatesError;

                return {
                  ...role,
                  candidates: candidates || [],
                };
              })
            );

            return {
              ...poll,
              roles: rolesWithCandidates,
            };
          })
        );

        setPolls(pollsWithRoles);
        setSelectedPollId(pollsWithRoles[0].id);
        
        // Check existing votes
        checkExistingVotes(pollsWithRoles[0].id);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
      setError('Failed to load polls. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingVotes = async (pollId: string) => {
    if (!voterToken || !pollId) return;

    try {
      const poll = polls.find((p) => p.id === pollId);
      if (!poll) return;

      const roleIds = poll.roles.map((r) => r.id);
      const { data: existingVotes, error } = await supabase
        .from('votes')
        .select('role_id, candidate_id')
        .eq('voter_token', voterToken)
        .in('role_id', roleIds);

      if (error) throw error;

      const votedRoles = new Set<string>();
      const voteMap: Record<string, string | null> = {};

      existingVotes?.forEach((vote) => {
        votedRoles.add(vote.role_id);
        voteMap[vote.role_id] = vote.candidate_id;
      });

      setSubmittedRoles(votedRoles);
      setVotes(voteMap);
    } catch (error) {
      console.error('Error checking existing votes:', error);
    }
  };

  const handleVote = (roleId: string, candidateId: string | null) => {
    if (submittedRoles.has(roleId)) return;
    setVotes(prev => ({ ...prev, [roleId]: candidateId }));
  };

  const submitVote = async (roleId: string) => {
    if (!voterToken) {
      setError('Invalid voting session. Please verify your credentials again.');
      return;
    }

    const candidateId = votes[roleId];
    
    if (candidateId === undefined) {
      setError('Please select a candidate before voting');
      return;
    }

    try {
      const voteData = {
        role_id: roleId,
        voter_id: voterToken,  // Match schema UNIQUE constraint
        candidate_id: candidateId,
        timestamp: new Date().toISOString()
      };

      const { error: voteError } = await supabase
        .from('votes')
        .insert(voteData);

      if (voteError) {
        if (voteError.code === '23505') {
          setError('You have already voted for this role');
        } else {
          throw voteError;
        }
        return;
      }

      // Mark role as submitted
      setSubmittedRoles(prev => new Set([...Array.from(prev), roleId]));

    } catch (error) {
      console.error('Error submitting vote:', error);
      setError('Failed to submit vote. Please try again.');
    }
  };

  const allRolesVoted = polls.length > 0 && 
    polls.some(poll => poll.id === selectedPollId && poll.roles.every(role => submittedRoles.has(role.id)));

  return {
    polls,
    selectedPollId,
    setSelectedPollId,
    votes,
    handleVote,
    submitVote,
    submittedRoles,
    isLoading,
    error,
    allRolesVoted,
    voterToken
  };
};

