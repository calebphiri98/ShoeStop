// import React from 'react';
// import Signup from '../../pages/Signup';

// const AdminUsers = ({ customers, onRefresh }) => {
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
//       {/* Reusing your standalone Signup component view for account provisioning */}
//       <div className="bg-white p-4 shadow-sm border border-gray-100 rounded lg:col-span-1">
//         <h3 className="text-md font-bold uppercase tracking-wide text-primary mb-4 border-b pb-2">
//           ➕ Provision Account
//         </h3>
//         {/* Pass an onSuccess trigger callback if your signup page handles it to reload the view dynamically */}
//         <Signup isAdminProvisioning={true} onCreationSuccess={onRefresh} />
//       </div>

//       {/* Directory Database */}
//       <div className="bg-white p-6 shadow-sm border border-gray-100 rounded lg:col-span-2">
//         <h3 className="text-md font-bold uppercase tracking-wide text-primary mb-4 border-b pb-2">
//           👥 Platform Directory ({customers.length})
//         </h3>
//         <div className="overflow-x-auto text-sm">
//           <table className="w-full text-left">
//             <thead>
//               <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-xs bg-neutralBg">
//                 <th className="p-3">User</th>
//                 <th className="p-3">Email</th>
//                 <th className="p-3 text-right">Scope Role</th>
//               </tr>
//             </thead>
//             <tbody>
//               {customers.map((c) => (
//                 <tr key={c.id} className="border-b border-gray-50 hover:bg-neutralBg/30 transition-colors">
//                   <td className="p-3 font-semibold text-primary">{c.name}</td>
//                   <td className="p-3 text-gray-600">{c.email}</td>
//                   <td className="p-3 text-right">
//                     <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
//                       c.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
//                     }`}>
//                       {c.role}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminUsers;
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* ACCOUNT PROVISIONING CREATION UTILITY LAYOUT FORM */}
      <div className="bg-white p-6 shadow-sm border border-gray-100 lg:col-span-1 h-fit rounded">
        <h3 className="text-md font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">
          ➕ Provision User Account
        </h3>
        
        {formError && <div className="bg-red-50 text-red-700 p-3 mb-4 text-xs font-medium rounded">{formError}</div>}
        {formSuccess && <div className="bg-emerald-50 text-emerald-700 p-3 mb-4 text-xs font-medium rounded">{formSuccess}</div>}
        
        <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Full Name</label>
            <input 
              required 
              type="text" 
              value={newUser.name} 
              onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
              className="w-full border border-gray-300 p-2.5 focus:outline-none focus:border-primary" 
              placeholder="John Phiri" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Email Address</label>
            <input 
              required 
              type="email" 
              value={newUser.email} 
              onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
              className="w-full border border-gray-300 p-2.5 focus:outline-none focus:border-primary" 
              placeholder="john@domain.com" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Initial Password</label>
            <input 
              required 
              type="password" 
              value={newUser.password} 
              onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
              className="w-full border border-gray-300 p-2.5 focus:outline-none focus:border-primary" 
              placeholder="••••••••" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Assigned Security Role</label>
            <select 
              value={newUser.role} 
              onChange={(e) => setNewUser({...newUser, role: e.target.value})} 
              className="w-full border border-gray-300 p-2.5 bg-white focus:outline-none focus:border-primary font-semibold text-primary"
            >
              <option value="customer">Customer Interface Profile</option>
              <option value="admin">Administrator (Full Systems Access)</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-primary text-secondary py-3 font-bold uppercase text-xs tracking-wider hover:bg-accent hover:text-primary transition-colors">
            Execute Registration
          </button>
        </form>
      </div>

      {/* COMPLETE REGISTERED USERS DIRECTORY VIEW */}
      <div className="bg-white p-6 shadow-sm border border-gray-100 lg:col-span-2 rounded">
        <h3 className="text-md font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">
          👥 Platform Directory ({customers.length})
        </h3>
        <div className="overflow-x-auto text-sm">
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
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminUsers;
