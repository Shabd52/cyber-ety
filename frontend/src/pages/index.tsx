import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../components/Logo';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    setIsLoading(false);
  }, []);

  // Redirect logged-in users to game
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push('/game');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading || isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cyber-black">
      <div className="container mx-auto py-16 px-4">
        <Logo />
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-cyber-blue mb-4 font-mono">
            CYBER ETYMOLOGY
          </h1>
          <p className="text-2xl text-cyber-cyan mb-8">
            Test your knowledge of cyber & tech word origins
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {isLoggedIn ? (
            <>
              {/* Play Game */}
              <div className="bg-cyber-dark border-2 border-cyber-green p-6 rounded-lg hover:border-cyan-400 transition">
                <h2 className="text-2xl text-cyber-green mb-4">🎮 Play Now</h2>
                <p className="text-cyber-cyan mb-6">
                  Ready to compete? Enter the game arena!
                </p>
                <button
                  onClick={() => router.push('/game')}
                  className="w-full px-4 py-2 bg-cyber-green hover:bg-cyber-cyan text-black font-bold rounded transition"
                >
                  Play Game
                </button>
              </div>

              {/* View Leaderboard */}
              <div className="bg-cyber-dark border-2 border-cyber-blue p-6 rounded-lg hover:border-cyan-400 transition">
                <h2 className="text-2xl text-cyber-blue mb-4">📊 Leaderboard</h2>
                <p className="text-cyber-cyan mb-6">
                  Check live rankings and team scores.
                </p>
                <button
                  onClick={() => router.push('/game')}
                  className="w-full px-4 py-2 bg-cyber-blue hover:bg-cyber-cyan text-black font-bold rounded transition"
                >
                  View Leaderboard
                </button>
              </div>

              {/* Logout */}
              <div className="bg-cyber-dark border-2 border-cyber-purple p-6 rounded-lg hover:border-cyan-400 transition">
                <h2 className="text-2xl text-cyber-purple mb-4">🚪 Account</h2>
                <p className="text-cyber-cyan mb-6">
                  Manage your account or logout.
                </p>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('teamName');
                    localStorage.removeItem('gameId');
                    router.push('/');
                    setIsLoggedIn(false);
                  }}
                  className="w-full px-4 py-2 bg-cyber-purple hover:bg-cyber-pink text-white font-bold rounded transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Getting Started */}
              <div className="bg-cyber-dark border-2 border-cyber-green p-6 rounded-lg hover:border-cyan-400 transition">
                <h2 className="text-2xl text-cyber-green mb-4">🚀 Getting Started</h2>
                <p className="text-cyber-cyan mb-6">
                  New player? Create your team account and start competing!
                </p>
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full px-4 py-2 bg-cyber-green hover:bg-cyber-cyan text-black font-bold rounded transition"
                >
                  Sign Up
                </button>
              </div>

              {/* Already Have Account */}
              <div className="bg-cyber-dark border-2 border-cyber-blue p-6 rounded-lg hover:border-cyan-400 transition">
                <h2 className="text-2xl text-cyber-blue mb-4">🎮 Play Game</h2>
                <p className="text-cyber-cyan mb-6">
                  Already registered? Login to your account and play!
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full px-4 py-2 bg-cyber-blue hover:bg-cyber-cyan text-black font-bold rounded transition"
                >
                  Login
                </button>
              </div>

              {/* Admin */}
              <div className="bg-cyber-dark border-2 border-cyber-purple p-6 rounded-lg hover:border-cyan-400 transition">
                <h2 className="text-2xl text-cyber-purple mb-4">⚙️ Admin</h2>
                <p className="text-cyber-cyan mb-6">
                  Manage games and monitor live leaderboards.
                </p>
                <button
                  onClick={() => router.push('/admin')}
                  className="w-full px-4 py-2 bg-cyber-purple hover:bg-cyber-pink text-white font-bold rounded transition"
                >
                  Admin Panel
                </button>
              </div>
            </>
          )}
        </div>

        {/* How to Play */}
        <div className="bg-cyber-dark border-2 border-cyber-green rounded-lg p-8 max-w-2xl mx-auto mt-12">
          <h2 className="text-2xl text-cyber-green mb-4">How to Play</h2>
          <ul className="space-y-3 text-cyber-cyan">
            <li className="flex items-start">
              <span className="text-cyber-green mr-3">1️⃣</span>
              <span>Sign up with your team (3 members required)</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyber-green mr-3">2️⃣</span>
              <span>Login to your account</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyber-green mr-3">3️⃣</span>
              <span>Wait for the admin to start a game from the admin panel</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyber-green mr-3">4️⃣</span>
              <span>Navigate to Game screen and answer questions</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyber-green mr-3">5️⃣</span>
              <span>Climb the leaderboard and prove your etymology knowledge!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
