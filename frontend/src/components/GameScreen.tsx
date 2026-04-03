import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

interface Question {
  id: string;
  index: number;
  characters: string;
  type: 'START' | 'CONTAIN';
  timeLimit: number;
}

interface GameScreenProps {
  gameId: string;
}

export default function GameScreen({ gameId }: GameScreenProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [word, setWord] = useState('');
  const [timer, setTimer] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize Socket.IO
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    // Join team
    socketRef.current.emit('join-team', {
      gameId,
      userId: localStorage.getItem('userId'),
    });

    // Listen for question released
    socketRef.current.on('question-released', (data: any) => {
      setQuestion({
        id: data.questionId || 'q' + Date.now(),
        index: data.questionIndex,
        characters: data.characters,
        type: data.type,
        timeLimit: data.timeLimit,
      });
      setWord('');
      setSubmitted(false);
      setTimer(data.timeLimit);

      // Start timer countdown
      startTimer(data.timeLimit);
    });

    // Listen for timer updates
    socketRef.current.on('timer-update', (data: any) => {
      setTimer(data.remainingTime);
    });

    // Listen for leaderboard updates
    socketRef.current.on('leaderboard-update', (data: any) => {
      setLeaderboard(data.standings);
    });

    // Request fullscreen
    if (typeof document !== 'undefined' && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        console.log('Fullscreen request failed');
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameId]);

  const startTimer = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let remaining = seconds;
    timerRef.current = setInterval(() => {
      remaining--;
      setTimer(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!submitted) {
          handleSubmit(); // Auto-submit empty (skip)
        }
      }
    }, 1000);
  };

  const handleSubmit = async () => {
    if (submitted || !question) return;

    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = question.timeLimit - timer;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/submission/answer`,
        {
          questionId: question.id,
          word: word.trim(),
          timeTaken,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setScore(response.data.data.score || 0);

        // Emit to socket
        socketRef.current?.emit('submit-answer', {
          questionId: question.id,
          word: word.trim(),
          score: response.data.data.score,
          isValid: response.data.data.isValid,
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const handleSkip = () => {
    handleSubmit(); // Submit empty word
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold glow-green animate-glow-pulse mb-4">
            WAITING FOR QUESTION...
          </h1>
          <p className="text-cyber-blue">Admin will release the first question soon</p>
        </div>
      </div>
    );
  }

  const timerColor = timer <= 10 ? 'text-cyber-pink' : timer <= 20 ? 'text-cyber-purple' : 'text-cyber-blue';

  return (
    <div className="min-h-screen bg-cyber-black text-white p-8 fullscreen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold glow-blue">CYBER ETYMOLOGY</h1>
          <p className="text-cyber-green">Question {question.index} / 5</p>
        </div>
        <div className={`text-4xl font-bold ${timerColor} animate-glow-pulse`}>
          {timer}s
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-cyber-dark border-2 border-cyber-blue p-8 rounded-lg glow-blue mb-8">
          <div className="text-center mb-4">
            <p className="text-cyber-green text-lg mb-2">
              {question.type === 'START' ? 'Word must START with' : 'Word must CONTAIN'}
            </p>
            <div className="text-6xl font-bold text-cyber-purple glow-purple animate-glow-pulse">
              {question.characters.toUpperCase()}
            </div>
          </div>

          <div className="border-t border-cyber-blue pt-4">
            <p className="text-cyber-blue text-center text-sm">
              {question.type === 'START'
                ? `Enter a tech-related word starting with "${question.characters.toUpperCase()}"`
                : `Enter a tech-related word containing all letters: ${question.characters.toUpperCase()}`}
            </p>
          </div>
        </div>

        {/* Input Section */}
        {!submitted ? (
          <div className="space-y-4">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value.toLowerCase())}
              onKeyDown={(e) => {
                // Prevent Enter key submission
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              placeholder="Type your answer..."
              className="w-full px-6 py-4 bg-cyber-black border-2 border-cyber-green text-cyber-green text-2xl rounded text-center focus:border-cyber-purple"
              autoFocus
              disabled={submitted}
            />

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                className="flex-1 py-4 bg-cyber-green text-cyber-black font-bold text-lg rounded hover:bg-cyber-blue transition-all glow-green"
              >
                SUBMIT
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 py-4 bg-cyber-pink border-2 border-cyber-pink text-cyber-pink font-bold text-lg rounded hover:bg-cyber-pink hover:text-cyber-black transition-all"
              >
                SKIP
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-cyber-dark border-2 border-cyber-green p-8 rounded-lg text-center glow-green">
            <h2 className="text-3xl font-bold mb-4">Answer Submitted</h2>
            <p className="text-2xl text-cyber-green mb-2">Score: +{score}</p>
            <p className="text-cyber-blue">Word: {word || '(skipped)'}</p>
            <p className="text-cyber-blue mt-4 animate-pulse">Waiting for next question...</p>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="max-w-2xl mx-auto mt-12">
          <h3 className="text-2xl font-bold text-cyber-blue mb-4">Live Leaderboard</h3>
          <div className="bg-cyber-dark border-2 border-cyber-blue p-4 rounded">
            {leaderboard.slice(0, 5).map((entry: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-cyber-blue last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <span className="text-cyber-green font-bold text-xl w-8">{entry.rank}</span>
                  <span className="text-cyber-blue">{entry.teamName}</span>
                </div>
                <span className="text-cyber-green font-bold text-xl">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
