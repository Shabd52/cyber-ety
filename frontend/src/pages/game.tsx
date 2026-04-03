import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import Logo from '../components/Logo';

interface Question {
  index: number;
  type: string;
  characters: string[];
  timeLimit: number;
}

export default function GameScreen() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  
  // Game state
  const [isLoading, setIsLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [gameActive, setGameActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [userAnswer, setUserAnswer] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const questionStartTimeRef = useRef<number | null>(null);

  // Parse stored data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const teamNameStored = localStorage.getItem('teamName');
    const gameId = localStorage.getItem('gameId');
    
    if (!token) {
      router.push('/login');
      return;
    }

    // Clear any previous session's question timers
    for (let i = 0; i < 5; i++) {
      sessionStorage.removeItem(`question_${i}_startTime`);
    }

    setTeamName(teamNameStored || '');
    
    // Initialize Socket.IO
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
    });

    socketRef.current = socket;

    // Listen for game events
    socket.on('question-released', (data) => {
      console.log('Question released:', data);
      setCurrentQuestion({
        index: data.questionIndex,
        type: data.type,
        characters: data.characters,
        timeLimit: data.timeLimit,
      });
      setQuestionIndex(data.questionIndex);
      setTimeRemaining(data.timeLimit);
      setUserAnswer('');
      setValidationResult(null);
      setGameActive(true);
    });

    socket.on('answer-validated', (data) => {
      if (data.isValid) {
        setTotalScore(data.totalScore || 0);
        setValidationResult(`✓ VALID! +${data.score} points`);
      } else {
        setValidationResult(`✗ INVALID: ${data.reason}`);
      }
    });

    socket.on('game-status', (data) => {
      if (data.status === 'ended') {
        setGameActive(false);
      }
    });

    // Fetch current game state
    const fetchGameState = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/game/current`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success && response.data.data.currentQuestion) {
          const data = response.data.data;
          setCurrentQuestion({
            index: data.currentQuestionIndex,
            type: data.currentQuestion.type,
            characters: data.currentQuestion.characters,
            timeLimit: data.currentQuestion.timeLimit,
          });
          setQuestionIndex(data.currentQuestionIndex);
          setTimeRemaining(data.currentQuestion.timeLimit);
          setGameActive(true);
          
          // Store gameId for later use
          localStorage.setItem('gameId', data.gameId);
        }
      } catch (error) {
        console.log('No active game yet');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameState();

    return () => {
      socket.disconnect();
    };
  }, [router]);

  // Timer countdown - Calculate from question start time to persist across refreshes
  useEffect(() => {
    if (!gameActive || !currentQuestion) return;

    // Calculate elapsed time from sessionStorage if it exists (page refresh scenario)
    const storedStartTime = sessionStorage.getItem(`question_${currentQuestion.index}_startTime`);
    let elapsedSeconds = 0;

    if (storedStartTime) {
      // Page was refreshed; calculate elapsed time from stored timestamp
      elapsedSeconds = Math.floor((Date.now() - parseInt(storedStartTime)) / 1000);
      const remaining = Math.max(0, currentQuestion.timeLimit - elapsedSeconds);
      setTimeRemaining(remaining);
    } else {
      // New question; store the start time
      const startTime = Date.now();
      sessionStorage.setItem(`question_${currentQuestion.index}_startTime`, startTime.toString());
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return currentQuestion.timeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActive, currentQuestion]);

  // Cleanup sessionStorage on game end
  useEffect(() => {
    if (roundOver) {
      // Clear all question start times from sessionStorage
      for (let i = 0; i < 5; i++) {
        sessionStorage.removeItem(`question_${i}_startTime`);
      }
    }
  }, [roundOver]);

  const handleTimeUp = async () => {
    // Auto-skip on time up
    await handleSkip();
  };

  const loadNextQuestion = async () => {
    try {
      const token = localStorage.getItem('token');
      const gameId = localStorage.getItem('gameId');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/game/current`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.data.currentQuestion) {
        const data = response.data.data;
        // Check if we've completed all 5 questions (index should be 0-4 for questions 1-5)
        if (data.currentQuestionIndex >= 5) {
          setRoundOver(true);
          setGameActive(false);
          return;
        }
        
        setCurrentQuestion({
          index: data.currentQuestionIndex,
          type: data.currentQuestion.type,
          characters: Array.isArray(data.currentQuestion.characters)
            ? data.currentQuestion.characters
            : [data.currentQuestion.characters],
          timeLimit: data.currentQuestion.timeLimit,
        });
        setQuestionIndex(data.currentQuestionIndex);
        setTimeRemaining(data.currentQuestion.timeLimit);
        setUserAnswer('');
        setValidationResult(null);
      } else if (!response.data.data.currentQuestion) {
        // No more questions - round over
        setRoundOver(true);
        setGameActive(false);
      }
    } catch (error) {
      console.error('Error loading next question:', error);
      // Assume round is over if we can't load the next question
      setRoundOver(true);
      setGameActive(false);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer || !currentQuestion || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/submission/answer`,
        {
          gameId: localStorage.getItem('gameId'),
          questionIndex,
          word: userAnswer,
          timeSpent: currentQuestion.timeLimit - timeRemaining,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (response.data.success) {
        setValidationResult(
          response.data.data.isValid
            ? `✓ VALID! +${response.data.data.score} points`
            : `✗ INVALID: ${response.data.data.reason}`
        );
        setTotalScore(response.data.data.totalScore || 0);

        // Auto-advance to next question after 2 seconds
        setTimeout(() => {
          loadNextQuestion();
        }, 2000);
      } else {
        setValidationResult(`✗ Error: ${response.data.error}`);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Network error';
      console.error('Submission error:', error);
      setValidationResult(`✗ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/submission/skip`,
        {
          gameId: localStorage.getItem('gameId'),
          questionIndex,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (response.data.success) {
        setUserAnswer('');
        setValidationResult('Question skipped');
        
        // Auto-advance to next question after 1 second
        setTimeout(() => {
          loadNextQuestion();
        }, 1000);
      }
    } catch (error) {
      console.error('Skip error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-black">
        <div className="text-center">
          <p className="text-cyber-cyan mb-4">Loading game...</p>
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyber-blue"></div>
          </div>
        </div>
      </div>
    );
  }

  if (roundOver) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-cyber-green mb-8 font-mono">
            ROUND COMPLETE
          </h1>
          
          <div className="bg-cyber-dark border-2 border-cyber-green rounded-lg p-12 max-w-md">
            <p className="text-cyber-cyan text-2xl mb-6">Final Results</p>
            
            <p className="text-cyber-blue text-3xl font-bold mb-8">
              {teamName}
            </p>
            
            <div className="text-5xl font-bold text-cyber-green">
              {totalScore} pts
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gameActive || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-cyber-blue mb-4">Cyber Etymology</h1>
          <p className="text-cyber-cyan text-lg mb-6">Waiting for game to start...</p>
          <p className="text-cyber-green">Team: {teamName}</p>
        </div>
      </div>
    );
  }

  const characterStr = currentQuestion.characters.join(', ');
  const question =
    currentQuestion.type === 'START'
      ? `Find a word that STARTS with '${characterStr}'`
      : `Find a word that CONTAINS '${characterStr}'`;

  return (
    <div className="min-h-screen bg-cyber-black">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center mb-4">
          <div className="h-16">
            <Logo />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-cyber-blue text-center mb-8">
          Cyber Etymology
        </h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Main Game Area */}
          <div>
            <div className="bg-cyber-dark border-2 border-cyber-blue rounded-lg p-8">
              <div className="text-center mb-8">
                <p className="text-cyber-green text-lg mb-4">
                  Question {questionIndex + 1} of 5
                </p>
                <p className="text-cyber-cyan text-xl mb-8 font-bold">{question}</p>

                {/* Timer */}
                <div className="text-5xl text-cyber-pink font-bold mb-8 font-mono">
                  {String(Math.floor(timeRemaining / 60)).padStart(2, '0')}:
                  {String(timeRemaining % 60).padStart(2, '0')}
                </div>

                {/* Input */}
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value.toLowerCase())}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isSubmitting) {
                      handleSubmit();
                    }
                  }}
                  placeholder="Enter your word..."
                  className="w-full px-4 py-3 bg-cyber-black border-2 border-cyber-blue rounded mb-6 text-white focus:outline-none focus:border-cyber-cyan text-lg"
                  disabled={isSubmitting}
                  autoFocus
                />

                {/* Validation Result */}
                {validationResult && (
                  <div className={`mb-6 p-4 rounded text-lg font-bold ${
                    validationResult.startsWith('✓')
                      ? 'bg-cyber-green bg-opacity-20 text-cyber-green border-2 border-cyber-green'
                      : 'bg-cyber-pink bg-opacity-20 text-cyber-pink border-2 border-cyber-pink'
                  }`}>
                    {validationResult}
                  </div>
                )}

                {/* Score Display */}
                <div className="mb-6 text-cyber-green text-xl font-bold">
                  Your Score: {totalScore}
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!userAnswer || isSubmitting}
                    className="flex-1 px-4 py-3 bg-cyber-blue hover:bg-cyber-cyan disabled:opacity-50 text-black font-bold rounded transition text-lg"
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                  </button>
                  <button
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-cyber-purple hover:bg-cyber-pink disabled:opacity-50 text-white font-bold rounded transition text-lg"
                  >
                    SKIP
                  </button>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
