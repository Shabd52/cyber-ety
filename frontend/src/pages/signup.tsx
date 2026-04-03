import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';

interface Member {
  name: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    teamName: '',
    members: [{ name: '' }, { name: '' }, { name: '' }],
    collegeId: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (index: number, value: string) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index].name = value;
    setFormData((prev) => ({ ...prev, members: updatedMembers }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.members.some((m) => !m.name.trim())) {
      setError('All member names are required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          teamName: formData.teamName,
          members: formData.members,
          collegeId: formData.collegeId,
          password: formData.password,
        }
      );

      if (response.data.success) {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <Logo />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold glow-blue mb-2">CYBER ETYMOLOGY</h1>
          <p className="text-cyber-green">Register Your Team</p>
        </div>

        <form
          onSubmit={handleSignup}
          className="bg-cyber-dark border-2 border-cyber-blue p-8 rounded-lg glow-blue"
        >
          <h2 className="text-2xl font-bold text-cyber-blue mb-6">Team Registration</h2>

          {error && (
            <div className="bg-cyber-pink bg-opacity-10 border border-cyber-pink p-4 rounded mb-4 text-cyber-pink">
              {error}
            </div>
          )}

          {/* Team Name */}
          <div className="mb-6">
            <label className="block text-cyber-blue mb-2 font-bold">Team Name</label>
            <input
              type="text"
              name="teamName"
              value={formData.teamName}
              onChange={handleInputChange}
              placeholder="Enter your team name"
              className="w-full px-4 py-2 bg-cyber-black border-2 border-cyber-blue text-cyber-blue rounded"
              required
            />
          </div>

          {/* College ID */}
          <div className="mb-6">
            <label className="block text-cyber-blue mb-2 font-bold">College ID</label>
            <input
              type="text"
              name="collegeId"
              value={formData.collegeId}
              onChange={handleInputChange}
              placeholder="e.g., COLLEGE001"
              className="w-full px-4 py-2 bg-cyber-black border-2 border-cyber-blue text-cyber-blue rounded"
              required
            />
          </div>

          {/* Members */}
          <div className="mb-6">
            <label className="block text-cyber-blue mb-3 font-bold">Team Members (3 Required)</label>
            {formData.members.map((member, index) => (
              <input
                key={index}
                type="text"
                value={member.name}
                onChange={(e) => handleMemberChange(index, e.target.value)}
                placeholder={`Member ${index + 1}`}
                className="w-full px-4 py-2 bg-cyber-black border-2 border-cyber-blue text-cyber-blue rounded mb-2"
                required
              />
            ))}
          </div>

          {/* Password */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-cyber-blue mb-2 font-bold">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-cyber-black border-2 border-cyber-blue text-cyber-blue rounded"
                required
              />
            </div>
            <div>
              <label className="block text-cyber-blue mb-2 font-bold">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-cyber-black border-2 border-cyber-blue text-cyber-blue rounded"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyber-blue text-cyber-black font-bold rounded hover:bg-cyber-green disabled:opacity-50 transition-all"
          >
            {loading ? 'REGISTERING...' : 'REGISTER TEAM'}
          </button>

          <div className="mt-4 text-center">
            <span className="text-cyber-blue">Already registered? </span>
            <a href="/login" className="text-cyber-green hover:glow-green font-bold">
              LOGIN
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
