// import React, { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import API_URL from '../config/api';

// // Subcomponent imports matching layout specifications
// import AdminOverview from '../components/admin/AdminOverview';
// import AdminOrders from '../components/admin/AdminOrders';
// import Signup from './Signup'; 

// const AdminDashboard = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
  
//   // Navigation Routing Tab State
//   const [activeTab, setActiveTab] = useState('overview');
  
//   // Mobile Sidebar Visibility State
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // Relational Backoffice State Targets
//   const [orders, setOrders] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Middleware Response Validation Engine
//   const handleResponse = async (res) => {
//     const contentType = res.headers.get("content-type");
//     if (contentType && contentType.includes("application/json")) {
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || data.message || "API request failed");
//       return data;
//     }
//     const text = await res.text();
//     throw new Error(`Server returned HTML instead of JSON: ${res.status}`);
//   };

//   // Fetch Dashboard Database Pipelines
//   const fetchDashboardData = useCallback(async () => {
//     if (!user?.token) return;
//     setLoading(true);
//     try {
//       // Fetch Orders
//       const resOrders = await fetch(`${API_URL}/api/orders`, {
//         headers: { 'Authorization': `Bearer ${user.token}` }
//       });
//       const dataOrders = await handleResponse(resOrders);
//       setOrders(Array.isArray(dataOrders) ? dataOrders : []);

//       // Fetch Users/Customers
//       const resUsers = await fetch(`${API_URL}/api/users`, {
//         headers: { 'Authorization': `Bearer ${user.token}` }
//       });
//       const dataUsers = await handleResponse(resUsers);
//       setCustomers(Array.isArray(dataUsers) ? dataUsers : []);
//     } catch (err) {
//       console.error("Dashboard synchronization fault:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     if (!user || user.role !== 'admin') {
//       navigate('/login');
//       return;
//     }
//     fetchDashboardData();
//   }, [user, navigate, fetchDashboardData]);

//   // Track and Update Order Lifecycle State
//   const handleUpdateStatus = async (orderId, newStatus) => {
//     const originalOrders = [...orders];

//     // Optimistic UI update for smooth, zero-latency transitions
//     setOrders(prevOrders => 
//       prevOrders.map(order => {
//         const currentId = order.id || order._id;
//         return currentId === orderId ? { ...order, status: newStatus } : order;
//       })
//     );

//     // Explicitly parse and sanitize string keys to prevent database string serialization problems
//     const cleanId = String(orderId).replace('#', '');

//     try {
//       // TARGETING THE EXPLICIT STATUS TARGET PATCH ROUTE
//       const response = await fetch(`${API_URL}/api/orders/${cleanId}/status`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${user.token}`
//         },
//         body: JSON.stringify({ status: newStatus })
//       });
      
//       await handleResponse(response);
//     } catch (err) {
//       // Fallback rollback strategy upon execution fault
//       setOrders(originalOrders);
//       alert(`Status Synchronization Failed: ${err.message}`);
//     }
//   };

//   // Administrative User Purge Execution Matrix
//   const handleDeleteUser = async (userId, userName) => {
//     if (!window.confirm(`Are you absolutely sure you want to completely remove ${userName}?`)) {
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/api/users/${userId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${user.token}`
//         }
//       });
//       await handleResponse(response);
//       alert(`Successfully purged ${userName} from the core system directories.`);
//       fetchDashboardData(); 
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   if (!user) return null;

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen bg-neutralBg font-sans">
      
//       {/* MOBILE HEADER TOP-BAR */}
//       <div className="md:hidden bg-primary text-secondary flex items-center justify-between p-4 shadow-md sticky top-0 z-50">
//         <h1 className="text-xl font-bold tracking-widest text-accent uppercase">ShoeStop Admin</h1>
//         <button 
//           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//           className="text-accent text-2xl focus:outline-none p-1"
//         >
//           {isMobileMenuOpen ? '✕' : '☰'}
//         </button>
//       </div>

//       {/* SIDEBAR PANEL */}
//       <aside className={`
//         fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
//         md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
//         w-64 bg-primary text-secondary flex flex-col justify-between p-6 shadow-xl z-40 
//         md:flex shrink-0 h-screen sticky top-0
//       `}>
//         <div>
//           <h1 className="hidden md:block text-2xl font-bold tracking-widest text-accent uppercase mb-10 border-b border-accent/20 pb-4">
//             ShoeStop Admin
//           </h1>
//           <nav className="space-y-2 text-sm uppercase tracking-wider font-semibold mt-14 md:mt-0">
//             <button 
//               onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} 
//               className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${activeTab === 'overview' ? 'bg-accent text-primary font-bold' : 'hover:bg-accent/10 hover:text-accent'}`}
//             >
//               📊 Overview
//             </button>
//             <button 
//               onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }} 
//               className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${activeTab === 'orders' ? 'bg-accent text-primary font-bold' : 'hover:bg-accent/10 hover:text-accent'}`}
//             >
//               📦 Track Orders ({orders.length})
//             </button>
//             <button 
//               onClick={() => { setActiveTab('customers'); setIsMobileMenuOpen(false); }} 
//               className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${activeTab === 'customers' ? 'bg-accent text-primary font-bold' : 'hover:bg-accent/10 hover:text-accent'}`}
//             >
//               👥 Manage Users
//             </button>
//           </nav>
//         </div>
//         <div className="text-xs text-gray-400 font-medium pt-4 border-t border-accent/10">
//           Logged in as Admin: <span className="text-white block mt-1 truncate">{user.email}</span>
//         </div>
//       </aside>

//       {/* OVERLAY FOR OPEN MOBILE SIDEBAR */}
//       {isMobileMenuOpen && (
//         <div 
//           className="fixed inset-0 bg-black/50 z-30 md:hidden" 
//           onClick={() => setIsMobileMenuOpen(false)}
//         />
//       )}

//       {/* CORE WORKSPACE ENTRY CONTAINER */}
//       <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden">
//         <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-200">
//           <h2 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wide text-primary">
//             {activeTab === 'overview' && 'Dashboard Overview'}
//             {activeTab === 'orders' && 'Order Lifecycle Management'}
//             {activeTab === 'customers' && 'Account Provisioning & Users'}
//           </h2>
//           <button onClick={logout} className="w-full sm:w-auto bg-primary text-secondary px-5 py-2 font-bold uppercase text-xs tracking-wider border border-transparent hover:bg-transparent hover:text-primary hover:border-primary transition-all duration-200 text-center">
//             Secure Logout
//           </button>
//         </header>

//         {loading ? (
//           <p className="text-gray-500 font-medium">Synchronizing backoffice relational matrices...</p>
//         ) : (
//           <div className="w-full">
//             {activeTab === 'overview' && (
//               <AdminOverview orders={orders} customers={customers} />
//             )}

//             {activeTab === 'orders' && (
//               <AdminOrders orders={orders} onUpdateStatus={handleUpdateStatus} />
//             )}

//             {activeTab === 'customers' && (
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 <div className="bg-white p-6 shadow-sm border border-gray-100 lg:col-span-1 h-fit rounded">
//                   <h3 className="text-md font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">➕ Register Account</h3>
//                   <Signup />
//                 </div>

//                 <div className="bg-white p-6 shadow-sm border border-gray-100 lg:col-span-2 rounded overflow-hidden">
//                   <h3 className="text-md font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">
//                     👥 Platform Directory ({customers.length})
//                   </h3>
//                   <div className="overflow-x-auto text-sm">
//                     <table className="w-full text-left min-w-[500px]">
//                       <thead>
//                         <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-xs bg-neutralBg">
//                           <th className="p-3">User</th>
//                           <th className="p-3">Email</th>
//                           <th className="p-3">Role Scope</th>
//                           <th className="p-3 text-center">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {customers.map((c) => (
//                           <tr key={c._id || c.id} className="border-b border-gray-50 hover:bg-neutralBg/30 transition-colors">
//                             <td className="p-3 font-semibold text-primary">{c.name}</td>
//                             <td className="p-3 text-gray-600">{c.email}</td>
//                             <td className="p-3">
//                               <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${c.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
//                                 {c.role}
//                               </span>
//                             </td>
//                             <td className="p-3 text-center">
//                               {user.email !== c.email ? (
//                                 <button
//                                   onClick={() => handleDeleteUser(c._id || c.id, c.name)}
//                                   className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800 transition-colors px-2 py-1 rounded hover:bg-red-50"
//                                 >
//                                   🗑️ Delete
//                                 </button>
//                               ) : (
//                                 <span className="text-xs italic text-gray-400 font-medium">Current Session</span>
//                               )}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default AdminDashboard;
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

import AdminOverview from '../components/admin/AdminOverview';
import AdminOrders from '../components/admin/AdminOrders';
import Signup from './Signup';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchDashboardData = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const resOrders = await fetch(`${API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const dataOrders = await handleResponse(resOrders);
      setOrders(Array.isArray(dataOrders) ? dataOrders : []);

      const resUsers = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const dataUsers = await handleResponse(resUsers);
      setCustomers(Array.isArray(dataUsers) ? dataUsers : []);
    } catch (err) {
      console.error("Dashboard synchronization fault:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate, fetchDashboardData]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    const originalOrders = [...orders];
    setOrders(prevOrders =>
      prevOrders.map(order => {
        const currentId = order.id || order._id;
        return currentId === orderId ? { ...order, status: newStatus } : order;
      })
    );
    const cleanId = String(orderId).replace('#', '');
    try {
      const response = await fetch(`${API_URL}/api/orders/${cleanId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      await handleResponse(response);
    } catch (err) {
      setOrders(originalOrders);
      alert(`Status Synchronization Failed: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you absolutely sure you want to completely remove ${userName}?`)) return;
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      await handleResponse(response);
      alert(`Successfully removed ${userName}.`);
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  if (!user) return null;

  const tabLabel = {
    overview: 'Dashboard Overview',
    orders: 'Order Management',
    customers: 'Manage Users',
  }[activeTab];

  return (
    <div className="min-h-screen bg-neutralBg font-sans">

      {/* MOBILE TOP BAR */}
      <div className="md:hidden bg-primary text-secondary flex items-center justify-between px-4 py-3 shadow-md sticky top-0 z-50">
        <h1 className="text-base font-bold tracking-widest text-accent uppercase">ShoeStop Admin</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-accent text-xl focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className="flex">

        {/* SIDEBAR */}
        <aside className={`
          fixed top-0 left-0 h-full z-40 w-64 bg-primary text-secondary flex flex-col justify-between p-6 shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:sticky md:top-0 md:h-screen md:shrink-0
        `}>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-accent uppercase mb-8 border-b border-accent/20 pb-4 mt-2">
              ShoeStop Admin
            </h1>
            <nav className="space-y-1 text-sm uppercase tracking-wider font-semibold">
              {[
                { key: 'overview', label: `📊 Overview` },
                { key: 'orders', label: `📦 Track Orders (${orders.length})` },
                { key: 'customers', label: `👥 Manage Users` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${
                    activeTab === key
                      ? 'bg-accent text-primary font-bold'
                      : 'hover:bg-accent/10 hover:text-accent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="text-xs text-gray-400 font-medium pt-4 border-t border-accent/10">
            Logged in as Admin:
            <span className="text-white block mt-1 truncate">{user.email}</span>
          </div>
        </aside>

        {/* OVERLAY */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-10 overflow-x-hidden">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold uppercase tracking-wide text-primary leading-tight">
              {tabLabel}
            </h2>
            <button
              onClick={logout}
              className="shrink-0 bg-primary text-secondary px-4 py-2 font-bold uppercase text-xs tracking-wider border border-transparent hover:bg-transparent hover:text-primary hover:border-primary transition-all duration-200"
            >
              Secure Logout
            </button>
          </header>

          {loading ? (
            <p className="text-gray-500 font-medium text-sm">Loading dashboard data...</p>
          ) : (
            <>
              {activeTab === 'overview' && (
                <AdminOverview orders={orders} customers={customers} />
              )}

              {activeTab === 'orders' && (
                <AdminOrders orders={orders} onUpdateStatus={handleUpdateStatus} />
              )}

              {activeTab === 'customers' && (
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
                  <div className="bg-white p-5 shadow-sm border border-gray-100 rounded lg:col-span-1 h-fit">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">
                      ➕ Register Account
                    </h3>
                    <Signup />
                  </div>

                  <div className="bg-white p-5 shadow-sm border border-gray-100 rounded lg:col-span-2 overflow-hidden">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">
                      👥 Platform Directory ({customers.length})
                    </h3>
                    <div className="overflow-x-auto -mx-5 px-5">
                      <table className="w-full text-left text-sm min-w-[420px]">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-xs bg-neutralBg">
                            <th className="p-3">User</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Role</th>
                            <th className="p-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customers.map((c) => (
                            <tr key={c._id || c.id} className="border-b border-gray-50 hover:bg-neutralBg/30 transition-colors">
                              <td className="p-3 font-semibold text-primary">{c.name}</td>
                              <td className="p-3 text-gray-600 text-xs break-all">{c.email}</td>
                              <td className="p-3">
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                  c.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {c.role}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {user.email !== c.email ? (
                                  <button
                                    onClick={() => handleDeleteUser(c._id || c.id, c.name)}
                                    className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800 transition-colors px-2 py-1 rounded hover:bg-red-50"
                                  >
                                    🗑️ Delete
                                  </button>
                                ) : (
                                  <span className="text-xs italic text-gray-400 font-medium">You</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;