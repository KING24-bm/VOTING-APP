import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { verifyStudent, generateSecureVoterToken } from '../lib/api';

export default function StudentVerification() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

const handleVerifyStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const trimmedStudentId = studentId.trim();
      const trimmedClassId = classId.trim();
      
      if (!trimmedStudentId || !trimmedClassId) {
        setError('Please enter both Student ID and Class ID');
        setIsLoading(false);
        return;
      }

      const verificationResult = await verifyStudent(trimmedStudentId, trimmedClassId, false);
      
      if (!verificationResult.isValid) {
        setError(verificationResult.error || 'Verification failed. Try again.');
        setIsLoading(false);
        return;
      }

      const student = verificationResult.student!;
      
      const tokenResponse = await generateSecureVoterToken(student.student_id);
      const voterToken = tokenResponse.token;

      sessionStorage.setItem('verifiedStudent', JSON.stringify(student));
      sessionStorage.setItem('voterToken', voterToken);

      navigate('/StudentVoting');
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Header />

      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-green-600 dark:bg-green-700 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Verification</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Please enter your credentials to verify your identity
            </p>
          
          </div>

          <form onSubmit={handleVerifyStudent} className="space-y-6">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Student ID
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.trim())}
                placeholder="2122ES06XXXX"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Class ID
              </label>
              <input
                id="classId"
                type="text"
                value={classId}
                onChange={(e) => setClassId(e.target.value.trim().toUpperCase())}
                placeholder="X"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 uppercase"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              {isLoading ? 'Verifying...' : 'Verify Student'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
