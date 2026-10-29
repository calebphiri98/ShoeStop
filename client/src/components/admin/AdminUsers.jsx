import React, { useState } from 'react';
import API_URL from '../../config/api';

const AdminUsers = ({ customers, user, onRefresh }) => {
  // New User Form State Management
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' // Defaults to customer
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Local response validator matched with your main file handler
  const handleResponse = async (res) => {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "API request failed");
      return data;
    }
    const text = await res.text();
    throw new Error(`Server returned HTML instead of JSON: ${res.status}`);
  };

  // Administrative User Provisioning Route Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` // Admin protected route verification token
        },
        body: JSON.stringify(newUser)
      });

      const data = await handleResponse(response);
      setFormSuccess(`Successfully created new ${data.user?.role || newUser.role} account!`);

      // Reset form controls
      setNewUser({ name: '', email: '', password: '', role: 'customer' });

      // Trigger live refresh parent callback to pull latest DB data
      if (onRefresh) onRefresh();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

      {/* ACCOUNT PROVISIONING FORM — comes second on mobile so users land on the directory first, which is what they usually want to check */}
      <div className="bg-white p-4 sm:p-6 shadow-sm border border-gray-100 rounded-lg lg:col-span-1 h-fit order-2 lg:order-1">
        <h3 className="text-sm sm:text-md font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">
          ➕ Provision User Account
        </h3>

        {formError && <div className="bg-red-50 text-red-700 p-3 mb-4 text-xs font-medium rounded-md">{formError}</div>}
        {formSuccess && <div className="bg-emerald-50 text-emerald-700 p-3 mb-4 text-xs font-medium rounded-md">{formSuccess}</div>}

        <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Full Name</label>
            <input
              required
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full border border-gray-300 p-3 rounded-md text-base focus:outline-none focus:border-primary"
              placeholder="John Phiri"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Email Address</label>
            <input
              required
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full border border-gray-300 p-3 rounded-md text-base focus:outline-none focus:border-primary"
              placeholder="john@domain.com"
              autoCapitalize="none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Initial Password</label>
            <input
              required
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full border border-gray-300 p-3 rounded-md text-base focus:outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Assigned Security Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full border border-gray-300 p-3 rounded-md text-base bg-white focus:outline-none focus:border-primary font-semibold text-primary"
            >
              <option value="customer">Customer Interface Profile</option>
              <option value="admin">Administrator (Full Systems Access)</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-secondary py-3.5 font-bold uppercase text-xs tracking-wider rounded-md active:scale-[0.98] transition-transform hover:bg-accent hover:text-primary"
          >
            Execute Registration
          </button>
        </form>
      </div>

      {/* DIRECTORY — first on mobile */}
      <div className="bg-white p-4 sm:p-6 shadow-sm border border-gray-100 rounded-lg lg:col-span-2 order-1 lg:order-2">
        <h3 className="text-sm sm:text-md font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">
          👥 Platform Directory ({customers.length})
        </h3>

        {/* MOBILE: card stack — avoids the horizontal-overflow / overlap issue tables cause on narrow screens */}
        <div className="sm:hidden space-y-3">
          {customers.map((c) => (
            <div key={c.id || c.email} className="border border-gray-100 rounded-lg p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-primary text-sm truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 break-all mt-0.5">{c.email}</p>
                </div>
                <span className={`shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${
                  c.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {c.role}
                </span>
              </div>
            </div>
          ))}
          {customers.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No users yet.</p>
          )}
        </div>

        {/* DESKTOP / TABLET: table */}
        <div className="hidden sm:block overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-xs bg-neutralBg">
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3 text-right">Scope Role Badge</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id || c.email} className="border-b border-gray-50 hover:bg-neutralBg/30 transition-colors">
                  <td className="p-3 font-semibold text-primary">{c.name}</td>
                  <td className="p-3 text-gray-600">{c.email}</td>
                  <td className="p-3 text-right">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                      c.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {c.role}
                    </span>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-400 text-sm">No users yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminUsers;