import { useState, useEffect } from 'react';

export interface CaptchaChallenge {
  id: string;
  challenge: string;
  hint: string;
  expiresAt: number;
}

const generateAdvancedMathCaptcha = (): CaptchaChallenge => {
  const ops = ['+', '-', '*'];
  const num1 = Math.floor(Math.random() * 50) + 10;
  const num2 = Math.floor(Math.random() * 50) + 10;
  const op = ops[Math.floor(Math.random() * ops.length)];
  
  let answer: number;
  let challenge: string;
  if (op === '+') {
    answer = num1 + num2;
    challenge = `${num1} + ${num2}`;
  } else if (op === '-') {
    answer = num1 - num2;
    challenge = `${num1} - ${num2}`;
  } else {
    answer = num1 * num2;
    challenge = `${num1} × ${num2}`;
  }

  const id = crypto.randomUUID();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min

  return {
    id,
    challenge,
    hint: `Answer: ${answer.toString()} (hidden for demo)`,
    expiresAt
  };
};

interface EnhancedCaptchaProps {
  onVerify: (isValid: boolean) => void;
}

const EnhancedCaptcha: React.FC<EnhancedCaptchaProps> = ({ onVerify }) => {
  const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadNewCaptcha = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newCaptcha = generateAdvancedMathCaptcha();
      setCaptcha(newCaptcha);
      setUserInput('');
      setError('');
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    loadNewCaptcha();
  }, []);

  const verifyCaptcha = () => {
    if (!captcha) return;

    const expected = captcha.hint.replace('Answer: ', '').trim();
    const userAns = userInput.trim();

    if (userAns === expected) {
      onVerify(true);
    } else {
      setError('Incorrect. Try again.');
      loadNewCaptcha();
      onVerify(false);
    }
  };

  const isExpired = captcha ? captcha.expiresAt < Date.now() : false;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        🤖 Security Verification
      </label>
      <button 
        onClick={loadNewCaptcha}
        disabled={isLoading}
        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
      >
        Refresh CAPTCHA
      </button>
      
      {captcha && (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center font-mono text-2xl min-h-[100px] flex items-center justify-center">
          {captcha.challenge}
          {isExpired && <p className="text-sm text-red-500 mt-2">Expired - Refresh</p>}
        </div>
      )}
      
      <div>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-xl"
          placeholder="Enter answer"
          disabled={isLoading || isExpired}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      
      <button
        onClick={verifyCaptcha}
        disabled={!captcha || isLoading || isExpired || !userInput.trim()}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
      >
        Verify CAPTCHA
      </button>
    </div>
  );
};

export default EnhancedCaptcha;

