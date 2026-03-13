import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeOffIcon, LogIn } from 'lucide-react';
import Header from './Header';


const TeacherLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // CAPTCHA states
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaUserAnswer, setCaptchaUserAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  
  const navigate = useNavigate();
  const { login, teacher } = useAuth();

  const generateCaptcha = () => {
    const types = [
      () => {
        const num2 = Math.floor(Math.random() * 80) + 10;
        const num1 = Math.floor(Math.random() * (90 - num2)) + num2 + 10;
        const ops = ['+', '-'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        const question = `${num1} ${op} ${num2}`;
        let answer = '';
        if (op === '+') answer = (num1 + num2).toString();
        else answer = (num1 - num2).toString();
        return { question, answer: answer.toLowerCase() };
      }
    ];
    const type = types[0]();
    const { question, answer } = type;
    setCaptchaQuestion(question);
    setCaptchaAnswer(answer);
    setCaptchaUserAnswer('');
    setCaptchaError(false);
  };

  const validateInputs = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!password) {
      setError('Password is required');
      return false;
    }

    const userAns = captchaUserAnswer.trim().toLowerCase();
    if (userAns !== captchaAnswer) {
      setCaptchaError(true);
      setError('Please solve the CAPTCHA correctly');
      generateCaptcha();
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        navigate('/TeacherDashboard');
      } else {
        let errorMsg = 'Login failed. Please check your credentials.';
        if (teacher && !teacher.is_approved) {
          errorMsg = 'Your account is pending superadmin approval. Please wait.';
        }
        setError(errorMsg);
        generateCaptcha();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      generateCaptcha();
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 dark:bg-blue-700 p-4 rounded-full">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
            Administrator Login
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Log in to access your dashboard
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <div>
              <label htmlFor="captcha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <span className="mr-2">🤖</span>
                Verification Challenge
              </label>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-center font-medium text-lg">
                  {captchaQuestion}
                </div>
                <input
                  id="captcha"
                  type="text"
                  value={captchaUserAnswer}
                  onChange={(e) => {
                    setCaptchaUserAnswer(e.target.value);
                    if (captchaError) setCaptchaError(false);
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    captchaError 
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/20 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Type your answer here..."
                  disabled={loading}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          
          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Need to create account?{' '}
            <Link to="/TeacherSignup" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
              Submit signup request
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;

