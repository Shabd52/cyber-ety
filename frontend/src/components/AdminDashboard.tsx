import { useState, useEffect } from 'react';
import axios from 'axios';

interface Team {
  id: string;
  teamName: string;
  members: Array<{ name: string }>;
  score: number;
  rank?: number;
  isDisqualified?: boolean;
}

export default function AdminDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [gameStatus, setGameStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'control' | 'monitoring' | 'leaderboard' | 'analytics'>(
    'control'
  );

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/team/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      setTeams(response.data.data);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const handleStartGame = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/game/start`,
        { round: 'preliminary' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      setGameStatus('in-progress');
    } catch (error) {
      console.error('Failed to start game:', error);
    }
    setLoading(false);
  };

  const handleNextQuestion = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/game/next-question`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
    } catch (error) {
      console.error('Failed to advance question:', error);
    }
  };

  const handleDisqualifyTeam = async (teamId: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/team/disqualify/${teamId}`,
        { reason: 'Admin disqualification' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
      await fetchTeams();
    } catch (error) {
      console.error('Failed to disqualify team:', error);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold glow-blue mb-2">ADMIN PANEL</h1>
          <p className="text-cyber-green">Cyber Etymology Game Control</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b-2 border-cyber-blue pb-4">
          {['control', 'monitoring', 'leaderboard', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 font-bold uppercase transition-all ${
                activeTab === tab
                  ? 'text-cyber-blue glow-blue border-b-2 border-cyber-blue'
                  : 'text-cyber-purple hover:text-cyber-blue'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'control' && (
          <div className="space-y-6">
            {/* Game Control */}
            <div className="bg-cyber-dark border-2 border-cyber-blue p-6 rounded-lg glow-blue">
              <h2 className="text-2xl font-bold text-cyber-blue mb-4">Game Control</h2>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleStartGame}
                  disabled={gameStatus !== 'pending' || loading}
                  className="flex-1 py-3 bg-cyber-green text-cyber-black font-bold rounded hover:bg-cyber-blue disabled:opacity-50"
                >
                  {loading ? 'STARTING...' : 'START GAME'}
                </button>
                <button className="flex-1 py-3 bg-cyber-purple border-2 border-cyber-purple text-cyber-purple font-bold rounded hover:bg-cyber-purple hover:text-cyber-black">
                  PAUSE
                </button>
                <button className="flex-1 py-3 bg-cyber-pink border-2 border-cyber-pink text-cyber-pink font-bold rounded hover:bg-cyber-pink hover:text-cyber-black">
                  STOP
                </button>
              </div>

              <div className="bg-cyber-black p-4 rounded mb-4">
                <p className="text-cyber-blue mb-2">Game Status: <span className="text-cyber-green font-bold">{gameStatus.toUpperCase()}</span></p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-3 bg-cyber-blue text-cyber-black font-bold rounded hover:bg-cyber-green transition-all"
              >
                NEXT QUESTION
              </button>
            </div>

            {/* Team Management */}
            <div className="bg-cyber-dark border-2 border-cyber-blue p-6 rounded-lg glow-blue">
              <h2 className="text-2xl font-bold text-cyber-blue mb-4">Team Management</h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-cyber-black p-4 rounded border border-cyber-blue flex justify-between items-center"
                  >
                    <div>
                      <p className="text-cyber-green font-bold">{team.teamName}</p>
                      <p className="text-cyber-blue text-sm">{team.members.length} members</p>
                    </div>
                    <button
                      onClick={() => handleDisqualifyTeam(team.id)}
                      className="px-4 py-2 bg-cyber-pink text-cyber-black font-bold rounded text-sm hover:bg-cyber-purple transition-all"
                    >
                      DISQUALIFY
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="bg-cyber-dark border-2 border-cyber-blue p-6 rounded-lg glow-blue">
            <h2 className="text-2xl font-bold text-cyber-blue mb-4">Live Monitoring</h2>
            <p className="text-cyber-green">Real-time submission tracking will appear here</p>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-cyber-dark border-2 border-cyber-blue p-6 rounded-lg glow-blue">
            <h2 className="text-2xl font-bold text-cyber-blue mb-4">Live Leaderboard</h2>
            <div className="space-y-2">
              {teams
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((team, index) => (
                  <div key={team.id} className="flex justify-between items-center py-3 border-b border-cyber-blue">
                    <div className="flex items-center gap-4">
                      <span className="text-cyber-green font-bold text-2xl w-8">#{index + 1}</span>
                      <span className="text-cyber-blue">{team.teamName}</span>
                    </div>
                    <span className="text-cyber-green font-bold text-2xl">{team.score || 0}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-cyber-dark border-2 border-cyber-blue p-6 rounded-lg glow-blue">
            <h2 className="text-2xl font-bold text-cyber-blue mb-4">Analytics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-cyber-black p-4 rounded border border-cyber-green">
                <p className="text-cyber-blue text-sm">Total Teams</p>
                <p className="text-4xl font-bold text-cyber-green">{teams.length}</p>
              </div>
              <div className="bg-cyber-black p-4 rounded border border-cyber-purple">
                <p className="text-cyber-blue text-sm">Questions</p>
                <p className="text-4xl font-bold text-cyber-purple">5</p>
              </div>
              <div className="bg-cyber-black p-4 rounded border border-cyber-pink">
                <p className="text-cyber-blue text-sm">Status</p>
                <p className="text-2xl font-bold text-cyber-pink">{gameStatus}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
