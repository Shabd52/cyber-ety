import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [collegeId, setCollegeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { collegeId, password }
      );

      if (response.data.success) {
        // Store token
        localStorage.setItem('token', response.data.data.token);
        router.push('/game');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Logo />
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold glow-blue mb-2">CYBER ETYMOLOGY</h1>
          <p className="text-cyber-green">Competitive Word-Building Game</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="bg-cyber-dark border-2 border-cyber-blue p-8 rounded-lg glow-blue"
        >
          <h2 className="text-2xl font-bold text-cyber-blue mb-6">Team Login</h2>

          {error && (
            <div className="bg-cyber-pink bg-opacity-10 border border-cyber-pink p-4 rounded mb-4 text-cyber-pink">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-cyber-blue mb-2 font-bold">College ID</label>
            <input
              type="text"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              placeholder="e.g., COLLEGE001"
              className="w-full px-4 py-2 bg-cyber-black border-2 border-cyber-blue text-cyber-blue rounded focus:border-cyber-green focus:glow-green"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-cyber-blue mb-2 font-bold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-cyber-black border-2 border-cyber-blue text-cyber-blue rounded focus:border-cyber-green"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyber-blue text-cyber-black font-bold rounded hover:bg-cyber-green hover:text-cyber-black disabled:opacity-50 transition-all glow-blue"
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>

          <div className="mt-4 text-center">
            <span className="text-cyber-blue">New team? </span>
            <a href="/signup" className="text-cyber-green hover:glow-green font-bold">
              SIGN UP
            </a>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-cyber-blue opacity-70">
          <p>Secure Team Authentication</p>
        </div>
      </div>
    </div>
  );
}
