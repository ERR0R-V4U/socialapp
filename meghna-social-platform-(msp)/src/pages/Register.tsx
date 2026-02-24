import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-[432px]">
        <div className="mb-4">
          <h2 className="text-3xl font-bold">Sign Up</h2>
          <p className="text-gray-500">It's quick and easy.</p>
        </div>
        <hr className="mb-4" />
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium">{error}</div>}
          
          <input 
            type="text" 
            name="name"
            placeholder="Full name" 
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            onChange={handleChange}
            required
          />
          
          <input 
            type="email" 
            name="email"
            placeholder="Email address" 
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            onChange={handleChange}
            required
          />

          <input 
            type="text" 
            name="phone"
            placeholder="Phone number" 
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            onChange={handleChange}
            required
          />

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date of birth</label>
            <input 
              type="date" 
              name="dob"
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>

          <input 
            type="password" 
            name="password"
            placeholder="New password" 
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            onChange={handleChange}
            required
          />

          <p className="text-[11px] text-gray-500 leading-tight">
            People who use our service may have uploaded your contact information to MSP. <Link to="#" className="text-blue-600 hover:underline">Learn more.</Link>
            <br /><br />
            By clicking Sign Up, you agree to our <Link to="#" className="text-blue-600 hover:underline">Terms</Link>, <Link to="#" className="text-blue-600 hover:underline">Privacy Policy</Link> and <Link to="#" className="text-blue-600 hover:underline">Cookies Policy</Link>.
          </p>

          <div className="text-center pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-green-600 text-white px-12 py-2 rounded-lg text-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <Link to="/login" className="text-blue-600 hover:underline text-sm">Already have an account?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
