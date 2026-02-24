import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row items-center justify-center p-4 lg:p-20 gap-10 lg:gap-20">
      <div className="max-w-md text-center lg:text-left">
        <h1 className="text-blue-600 text-6xl font-black tracking-tighter mb-4">MSP</h1>
        <p className="text-2xl font-medium text-gray-800 leading-tight">
          MEGHNA SOCIAL PLATFORM helps you connect and share with the people in your life.
        </p>
      </div>

      <div className="w-full max-w-[400px]">
        <div className="bg-white p-4 rounded-xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium">{error}</div>}
            <input 
              type="email" 
              placeholder="Email address" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <div className="text-center">
              <Link to="#" className="text-blue-600 text-sm hover:underline">Forgotten password?</Link>
            </div>
            <div className="border-t border-gray-200 pt-6 text-center">
              <Link 
                to="/register" 
                className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-bold hover:bg-green-600 transition-colors inline-block"
              >
                Create new account
              </Link>
            </div>
          </form>
        </div>
        <p className="text-sm mt-6 text-center">
          <span className="font-bold">Create a Page</span> for a celebrity, brand or business.
        </p>
      </div>
    </div>
  );
};

export default Login;
