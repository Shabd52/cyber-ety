import { useState, useEffect } from 'react';
import axios from 'axios';
import Logo from '../components/Logo';

interface LeaderboardEntry {
  rank: number;
  teamName: string;
  score: number;
}

export default function AdminPanel() {
  const [gameId, setGameId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [gameActive, setGameActive] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Fetch leaderboard periodically and check for active game
  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        
        // Check for stored gameId - only if game is actually active on backend
        const storedGameId = localStorage.getItem('gameId');
        if (storedGameId) {
          // Verify game is still active on backend
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/game/current`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response.data.data.currentQuestion) {
            // Game is active
            setGameId(storedGameId);
            setGameActive(true);
          } else {
            // Game is not active - clear the stored ID
            localStorage.removeItem('gameId');
            setGameActive(false);
          }
        }
      } catch (error) {
        // Error checking game state - clear the stored ID to allow starting new game
        localStorage.removeItem('gameId');
        setGameActive(false);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/game/leaderboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success && response.data.data.leaderboard.length > 0) {
          setLeaderboard(response.data.data.leaderboard);
        }
      } catch (error) {
        // Silently fail - no game active yet
      }
    };

    // Fetch game state immediately on mount
    fetchGameState();
    
    // Fetch leaderboard immediately and then every 5 seconds
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartGame = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token') || '';
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/game/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const id = response.data.data.gameId;
        setGameId(id);
        setGameActive(true);
        localStorage.setItem('gameId', id);
        setMessage(`✓ Game started! ID: ${id}`);
      }
    } catch (error: any) {
      setMessage(`✗ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center mb-6">
          <div className="h-16">
            <Logo />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-cyber-blue mb-8">Admin Panel</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Management */}
          <div className="lg:col-span-2">
            <div className="bg-cyber-dark border-2 border-cyber-blue rounded-lg p-8">
              <h2 className="text-2xl text-cyber-cyan mb-6">Game Management</h2>

              <div className="space-y-4">
                <button
                  onClick={handleStartGame}
                  disabled={loading || gameActive}
                  className="w-full px-6 py-3 bg-cyber-green hover:bg-cyber-cyan disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded transition text-lg"
                >
                  {loading ? 'Starting...' : 'START GAME'}
                </button>

                {message && (
                  <div className={`p-4 rounded text-lg ${
                    message.startsWith('✓')
                      ? 'bg-cyber-green bg-opacity-20 text-cyber-green border-2 border-cyber-green'
                      : 'bg-cyber-pink bg-opacity-20 text-cyber-pink border-2 border-cyber-pink'
                  }`}>
                    {message}
                  </div>
                )}

                {gameId && (
                  <div className="p-4 bg-cyber-blue bg-opacity-20 border-2 border-cyber-blue rounded">
                    <p className="text-cyber-cyan">Current Game ID:</p>
                    <p className="text-cyber-green font-mono text-sm break-all">{gameId}</p>
                  </div>
                )}

                <p className="text-cyber-cyan text-sm">
                  {gameActive
                    ? 'Teams can now visit /game to play!'
                    : 'Click START NEW GAME to begin! Teams can then join at /game'}
                </p>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-cyber-dark border-2 border-cyber-green rounded-lg p-6 sticky top-8">
              <h3 className="text-cyber-green text-lg font-bold mb-4">LEADERBOARD</h3>
              {leaderboard.length === 0 ? (
                <p className="text-cyber-cyan text-sm">No active game or teams yet</p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex justify-between p-2 rounded border-2 border-cyber-green"
                    >
                      <span className="text-cyber-cyan">
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}{' '}
                        {entry.teamName}
                      </span>
                      <span className="text-cyber-green font-bold">{entry.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
