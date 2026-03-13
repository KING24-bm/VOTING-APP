import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVotingSystem } from '../hooks/useVotingSystem';
import { Vote, CheckCircle, User, LogOut, ArrowLeft, ArrowRight } from 'lucide-react';
import Header from './Header';

interface VerifiedStudent {
  id: string;
  student_id: string;
  name: string;
  class_id: string;
}

export default function StudentVoting() {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState<VerifiedStudent | null>(null);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  
  // Using the custom hook for voting logic
  const {
    polls,
    selectedPollId,
    setSelectedPollId,
    votes,
    handleVote,
    submitVote,
    submittedRoles,
    isLoading,
    error,
    allRolesVoted
    // voterToken unused
  } = useVotingSystem();

  useEffect(() => {
    // Check if student was already verified in StudentVerification component
    const storedStudent = sessionStorage.getItem('verifiedStudent');
    if (storedStudent) {
      try {
        const parsedStudent = JSON.parse(storedStudent);
        setVerifiedStudent(parsedStudent);
        setIsVerified(true);
      } catch (error) {
        console.error('Error parsing stored student data:', error);
        sessionStorage.removeItem('verifiedStudent');
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear session storage and navigate back to verification page
    sessionStorage.removeItem('verifiedStudent');
    navigate('/StudentVerification');
  };

  const handleNextVoter = () => {
    handleLogout();
  };

  const handleNextSlide = async () => {
    const selectedPoll = polls.find((p) => p.id === selectedPollId);
    if (!selectedPoll) return;

    const currentRole = selectedPoll.roles[currentRoleIndex];
    
    // Validate that a selection has been made
    if (votes[currentRole.id] === undefined) {
      alert('Please select a candidate before proceeding'); // Or set error state
      return;
    }

    // Submit the vote for current role
    await submitVote(currentRole.id);

    // Move to next role if there is one
    if (currentRoleIndex < selectedPoll.roles.length - 1) {
      setCurrentRoleIndex(currentRoleIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentRoleIndex > 0) {
      setCurrentRoleIndex(currentRoleIndex - 1);
    }
  };

  // If not verified, this component should not be accessed directly
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to verification...</p>
        </div>
      </div>
    );
  }

  const selectedPoll = polls.find((p) => p.id === selectedPollId);

  // Show completion message when all roles are voted
  if (allRolesVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Header />
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <div className="bg-green-100 dark:bg-gray-700 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg text-sm font-medium">
              {verifiedStudent?.name}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 p-4 rounded-full">
                <Vote className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Student Voting</h1>
            <p className="text-gray-600 dark:text-gray-400">Cast your vote for each role</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-2 border-green-400 dark:border-green-600 rounded-2xl shadow-xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-600 p-4 rounded-full">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Voting Complete!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Thank you for voting. Your votes have been recorded successfully.
            </p>
            <button
              onClick={handleNextVoter}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              Next Voter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Header />
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <div className="bg-green-100 dark:bg-gray-700 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg text-sm font-medium">
              {verifiedStudent?.name}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading polls...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no polls available
  if (!selectedPoll || selectedPoll.roles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Header />
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <div className="bg-green-100 dark:bg-gray-700 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg text-sm font-medium">
              {verifiedStudent?.name}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">No active polls available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentRole = selectedPoll.roles[currentRoleIndex];
  // const hasVoted = submittedRoles.has(currentRole.id); // used as roleHasVoted per slide
  // const selectedCandidate = votes[currentRole.id]; // used as roleSelectedCandidate per slide
  const isLastSlide = currentRoleIndex === selectedPoll.roles.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Header />
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div className="bg-green-100 dark:bg-gray-700 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg text-sm font-medium">
            {verifiedStudent?.name}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-4 rounded-full">
              <Vote className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Student Voting</h1>
          <p className="text-gray-600 dark:text-gray-400">Cast your vote for each role</p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Question {currentRoleIndex + 1} of {selectedPoll.roles.length}</span>
            <span>{Math.round(((currentRoleIndex + 1) / selectedPoll.roles.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${((currentRoleIndex + 1) / selectedPoll.roles.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Poll selector if multiple polls exist */}
        {polls.length > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Poll
            </label>
            <select
              value={selectedPollId}
              onChange={(e) => setSelectedPollId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={true} // Disable during voting process
            >
              {polls.map((poll) => (
                <option key={poll.id} value={poll.id}>
                  {poll.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Slide container with animation */}
        <div className="overflow-hidden">
          <div 
            className="transition-transform duration-300 ease-in-out transform flex"
            style={{ transform: `translateX(-${currentRoleIndex * 100}%)` }}
          >
            {selectedPoll.roles.map((role, index) => {
              const roleHasVoted = submittedRoles.has(role.id);
              const roleSelectedCandidate = votes[role.id];
              
              return (
                <div 
                  key={role.id} 
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex-shrink-0 w-full transition-opacity duration-300 ${
                    index === currentRoleIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">{role.name}</h3>
                    {roleHasVoted && (
                      <span className="flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-2 rounded-full font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        Voted
                      </span>
                    )}
                  </div>

                  <div className="space-y-4 mb-6">
                    {/* Radio button group for candidates */}
                    {role.candidates.map((candidate) => {
                      const isSelected = roleSelectedCandidate === candidate.id;
                      
                      return (
                        <div
                          key={candidate.id}
                          className={`p-4 rounded-xl border-2 transition transform hover:scale-[1.02] cursor-pointer ${
                            isSelected
                              ? 'border-green-500 bg-green-50 dark:bg-green-900'
                              : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                          } ${roleHasVoted ? 'cursor-not-allowed opacity-75' : ''}`}
                          onClick={() => !roleHasVoted && handleVote(role.id, candidate.id)}
                        >
                          <div className="flex items-center">
                            <div className="mr-4">
                              <input
                                type="radio"
                                id={`candidate-${candidate.id}-${role.id}`}
                                name={`role-${role.id}`}
                                checked={isSelected}
                                onChange={() => {}}
                                disabled={roleHasVoted}
                                className="h-5 w-5 text-green-600 focus:ring-green-500"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between flex-grow">
                              <div className="flex items-center gap-4">
                                {candidate.logo_url && (
                                  <img
                                    src={candidate.logo_url}
                                    alt={`${candidate.name} logo`}
                                    className="w-12 h-12 object-cover rounded-full"
                                  />
                                )}
                                <div className="flex-shrink-0">
                                  {candidate.image_url ? (
                                    <img
                                      src={candidate.image_url}
                                      alt={candidate.name}
                                      className="w-12 h-12 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                      <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                  )}
                                </div>
                                
                                <label 
                                  htmlFor={`candidate-${candidate.id}-${role.id}`} 
                                  className={`text-lg font-medium ${
                                    isSelected ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-gray-100'
                                  }`}
                                >
                                  {candidate.name}
                                </label>
                              </div>
                              
                              {isSelected && !roleHasVoted && (
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                  Selected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* None of the Above option */}
                    <div
                      className={`p-4 rounded-xl border-2 transition transform hover:scale-[1.02] cursor-pointer ${
                        roleSelectedCandidate === null
                          ? 'border-green-500 bg-green-50 dark:bg-green-900'
                          : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                      } ${roleHasVoted ? 'cursor-not-allowed opacity-75' : ''}`}
                      onClick={() => !roleHasVoted && handleVote(role.id, null)}
                    >
                      <div className="flex items-center">
                        <div className="mr-4">
                          <input
                            type="radio"
                            id={`nota-${role.id}`}
                            name={`role-${role.id}`}
                            checked={roleSelectedCandidate === null}
                            onChange={() => {}}
                            disabled={roleHasVoted}
                            className="h-5 w-5 text-green-600 focus:ring-green-500"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between flex-grow">
                          <label 
                            htmlFor={`nota-${role.id}`} 
                            className={`text-lg font-medium ${
                              roleSelectedCandidate === null ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-gray-100'
                            }`}
                          >
                            None of the Above
                          </label>
                          
                          {roleSelectedCandidate === null && !roleHasVoted && (
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex justify-between">
                    <button
                      onClick={handlePrevSlide}
                      disabled={currentRoleIndex === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        currentRoleIndex === 0 
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </button>
                    
                    {!roleHasVoted ? (
                      <button
                        onClick={handleNextSlide}
                        disabled={roleSelectedCandidate === undefined}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLastSlide ? 'Submit All Votes' : 'Next'}
                        {!isLastSlide && <ArrowRight className="w-4 h-4" />}
                      </button>
                    ) : (
                      <button
                        onClick={handleNextSlide}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                      >
                        {isLastSlide ? 'Finish' : 'Next'}
                        {!isLastSlide && <ArrowRight className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
