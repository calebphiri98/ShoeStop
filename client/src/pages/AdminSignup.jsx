import React, { useState } from 'react';
import API_URL from '../config/api';

const AdminSignup = ({ onUserAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAdminProvision = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const contentType = response.headers.get("content-type");
      let data = {};
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Provisioning failed with status ${response.status}`);
      }

      setSuccess(`Successfully provisioned account for ${name} as an ${role.toUpperCase()}!`);
      
      // Flush fields out for next entry
      setName('');
      setEmail('');
      setPassword('');
      setRole('customer');

      if (onUserAdded) onUserAdded();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full bg-secondary">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 text-sm text-center border border-red-200 uppercase font-semibold tracking-wide">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-800 p-3 mb-4 text-sm text-center border border-green-200 uppercase font-semibold tracking-wide">
          {success}
        </div>
      )}

      <form onSubmit={handleAdminProvision} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-textDark mb-1">Full Name</label>
          <input 
            type="text" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-primary transition-colors bg-neutralBg/20"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-textDark mb-1">Email Address</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-primary transition-colors bg-neutralBg/20"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-textDark mb-1">Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-primary transition-colors bg-neutralBg/20"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-textDark mb-1">System Scope Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-primary bg-white font-medium uppercase tracking-wide cursor-pointer"
          >
            <option value="customer">👥 Customer Profile</option>
            <option value="admin">🛡️ System Admin</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="w-full bg-primary text-secondary py-3 mt-2 font-bold uppercase text-xs tracking-widest hover:bg-black transition-colors duration-200"
        >
          Create User Profile
        </button>
      </form>
    </div>
  );
};

export default AdminSignup;