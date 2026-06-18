import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// 🛠️ FIX 1: Import your API base URL configuration mapping
import API_URL from '../config/api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 🛠️ FIX 2: Prepend the API_URL context string to route the network request correctly
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      // 🛠️ FIX 3: Safe Parsing Engine — checks content-type before trying to read JSON
      const contentType = response.headers.get("content-type");
      let data = {};
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Registration failed with status code ${response.status}`);
      }

      // Redirect directly to login page so the user can sign in manually
      navigate('/login'); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-neutralBg px-4 py-12">
      <div className="w-full max-w-md bg-secondary p-8 shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold text-primary mb-2 uppercase tracking-wide text-center">Create Account</h2>
        <p className="text-gray-500 text-center mb-8">Join ShoeStop & More for exclusive fashion deals.</p>

        {error && <div className="bg-red-100 text-red-700 p-3 mb-4 text-sm text-center border border-red-200">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 p-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary text-secondary py-4 font-bold uppercase tracking-wider hover:bg-hoverAccent transition-colors duration-300"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:text-accent transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
