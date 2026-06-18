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

  // Lock body scroll when mobile drawer is open so content behind it can't be dragged/scrolled
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

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

  const tabMeta = {
    overview: { label: 'Overview', icon: '📊' },
    orders: { label: 'Orders', icon: '📦' },
    customers: { label: 'Users', icon: '👥' },
  }[activeTab];

  const navItems = [
    { key: 'overview', icon: '📊', label: 'Overview' },
    { key: 'orders', icon: '📦', label: 'Orders', badge: orders.length },
    { key: 'customers', icon: '👥', label: 'Users' },
  ];

  return (
    <div className="min-h-screen bg-neutralBg font-sans">

      {/* MOBILE TOP BAR — slimmer, no overlap with content below since it's sticky not fixed */}
      <div className="md:hidden bg-primary text-secondary flex items-center justify-between px-4 h-14 shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">{tabMeta.icon}</span>
          <h1 className="text-sm font-bold tracking-wide text-accent uppercase truncate">
            {tabMeta.label}
          </h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="shrink-0 w-10 h-10 -mr-1 flex items-center justify-center text-accent text-xl focus:outline-none active:scale-95 transition-transform"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className="flex">

        {/* SIDEBAR / MOBILE DRAWER */}
        <aside className={`
          fixed top-0 left-0 h-dvh z-50 w-72 max-w-[85vw] bg-primary text-secondary flex flex-col justify-between p-5 shadow-2xl
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:p-6
        `}>
          <div>
            <div className="flex items-center justify-between mb-6 mt-1">
              <h1 className="text-lg md:text-xl font-bold tracking-widest text-accent uppercase">
                ShoeStop Admin
              </h1>
              {/* Close button inside drawer for easy thumb reach on mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden w-9 h-9 flex items-center justify-center text-accent text-lg active:scale-95 transition-transform"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="border-b border-accent/20 mb-6" />
            <nav className="space-y-2 text-sm uppercase tracking-wider font-semibold">
              {navItems.map(({ key, label, icon, badge }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`w-full flex items-center justify-between text-left px-4 py-3.5 md:py-3 rounded-lg transition-all duration-200 active:scale-[0.98] ${
                    activeTab === key
                      ? 'bg-accent text-primary font-bold'
                      : 'hover:bg-accent/10 active:bg-accent/15 hover:text-accent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-base">{icon}</span>
                    <span>{label}</span>
                  </span>
                  {badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === key ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          <div className="text-xs text-gray-400 font-medium pt-4 border-t border-accent/10">
            Logged in as Admin:
            <span className="text-white block mt-1 truncate">{user.email}</span>
            <button
              onClick={logout}
              className="md:hidden w-full mt-4 bg-accent/10 text-accent py-3 font-bold uppercase text-xs tracking-wider rounded-lg active:scale-[0.98] transition-transform"
            >
              Secure Logout
            </button>
          </div>
        </aside>

        {/* OVERLAY */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 md:p-10 overflow-x-hidden">

          {/* Desktop-only header — mobile already shows the tab label in the top bar, so we don't repeat it and waste vertical space */}
          <header className="hidden md:flex justify-between items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-primary leading-tight">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'orders' && 'Order Management'}
              {activeTab === 'customers' && 'Manage Users'}
            </h2>
            <button
              onClick={logout}
              className="shrink-0 bg-primary text-secondary px-4 py-2 font-bold uppercase text-xs tracking-wider border border-transparent hover:bg-transparent hover:text-primary hover:border-primary transition-all duration-200"
            >
              Secure Logout
            </button>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin mb-3" />
              <p className="font-medium text-sm">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <AdminOverview orders={orders} customers={customers} />
              )}

              {activeTab === 'orders' && (
                <AdminOrders orders={orders} onUpdateStatus={handleUpdateStatus} />
              )}

              {activeTab === 'customers' && (
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white p-4 sm:p-5 shadow-sm border border-gray-100 rounded-lg lg:col-span-1 h-fit order-2 lg:order-1">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">
                      ➕ Register Account
                    </h3>
                    <Signup />
                  </div>

                  <div className="bg-white p-4 sm:p-5 shadow-sm border border-gray-100 rounded-lg lg:col-span-2 overflow-hidden order-1 lg:order-2">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">
                      👥 Platform Directory ({customers.length})
                    </h3>

                    {/* MOBILE: card stack — no horizontal scroll, no overlap, big tap targets */}
                    <div className="sm:hidden space-y-3">
                      {customers.map((c) => (
                        <div key={c._id || c.id} className="border border-gray-100 rounded-lg p-4">
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
                          {user.email !== c.email ? (
                            <button
                              onClick={() => handleDeleteUser(c._id || c.id, c.name)}
                              className="mt-3 w-full text-xs font-bold uppercase tracking-wider text-red-600 active:bg-red-50 transition-colors px-3 py-2.5 rounded-md border border-red-100"
                            >
                              🗑️ Delete User
                            </button>
                          ) : (
                            <p className="mt-3 text-xs italic text-gray-400 font-medium text-center">This is you</p>
                          )}
                        </div>
                      ))}
                      {customers.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-6">No users yet.</p>
                      )}
                    </div>

                    {/* DESKTOP / TABLET: table */}
                    <div className="hidden sm:block overflow-x-auto -mx-5 px-5">
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
// import React, { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import API_URL from '../config/api';

// import AdminOverview from '../components/admin/AdminOverview';
// import AdminOrders from '../components/admin/AdminOrders';
// import Signup from './Signup';

// const AdminDashboard = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const [activeTab, setActiveTab] = useState('overview');
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [orders, setOrders] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading] = useState(true);

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

//   const fetchDashboardData = useCallback(async () => {
//     if (!user?.token) return;
//     setLoading(true);
//     try {
//       const resOrders = await fetch(`${API_URL}/api/orders`, {
//         headers: { 'Authorization': `Bearer ${user.token}` }
//       });
//       const dataOrders = await handleResponse(resOrders);
//       setOrders(Array.isArray(dataOrders) ? dataOrders : []);

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

//   const handleUpdateStatus = async (orderId, newStatus) => {
//     const originalOrders = [...orders];
//     setOrders(prevOrders =>
//       prevOrders.map(order => {
//         const currentId = order.id || order._id;
//         return currentId === orderId ? { ...order, status: newStatus } : order;
//       })
//     );
//     const cleanId = String(orderId).replace('#', '');
//     try {
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
//       setOrders(originalOrders);
//       alert(`Status Synchronization Failed: ${err.message}`);
//     }
//   };

//   const handleDeleteUser = async (userId, userName) => {
//     if (!window.confirm(`Are you absolutely sure you want to completely remove ${userName}?`)) return;
//     try {
//       const response = await fetch(`${API_URL}/api/users/${userId}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${user.token}` }
//       });
//       await handleResponse(response);
//       alert(`Successfully removed ${userName}.`);
//       fetchDashboardData();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setIsMobileMenuOpen(false);
//   };

//   if (!user) return null;

//   const tabLabel = {
//     overview: 'Dashboard Overview',
//     orders: 'Order Management',
//     customers: 'Manage Users',
//   }[activeTab];

//   return (
//     <div className="min-h-screen bg-neutralBg font-sans">

//       {/* MOBILE TOP BAR */}
//       <div className="md:hidden bg-primary text-secondary flex items-center justify-between px-4 py-3 shadow-md sticky top-0 z-50">
//         <h1 className="text-base font-bold tracking-widest text-accent uppercase">ShoeStop Admin</h1>
//         <button
//           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//           className="text-accent text-xl focus:outline-none"
//           aria-label="Toggle menu"
//         >
//           {isMobileMenuOpen ? '✕' : '☰'}
//         </button>
//       </div>

//       <div className="flex">

//         {/* SIDEBAR */}
//         <aside className={`
//           fixed top-0 left-0 h-full z-40 w-64 bg-primary text-secondary flex flex-col justify-between p-6 shadow-xl
//           transform transition-transform duration-300 ease-in-out
//           ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
//           md:relative md:translate-x-0 md:sticky md:top-0 md:h-screen md:shrink-0
//         `}>
//           <div>
//             <h1 className="text-xl font-bold tracking-widest text-accent uppercase mb-8 border-b border-accent/20 pb-4 mt-2">
//               ShoeStop Admin
//             </h1>
//             <nav className="space-y-1 text-sm uppercase tracking-wider font-semibold">
//               {[
//                 { key: 'overview', label: `📊 Overview` },
//                 { key: 'orders', label: `📦 Track Orders (${orders.length})` },
//                 { key: 'customers', label: `👥 Manage Users` },
//               ].map(({ key, label }) => (
//                 <button
//                   key={key}
//                   onClick={() => handleTabChange(key)}
//                   className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${
//                     activeTab === key
//                       ? 'bg-accent text-primary font-bold'
//                       : 'hover:bg-accent/10 hover:text-accent'
//                   }`}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </nav>
//           </div>
//           <div className="text-xs text-gray-400 font-medium pt-4 border-t border-accent/10">
//             Logged in as Admin:
//             <span className="text-white block mt-1 truncate">{user.email}</span>
//           </div>
//         </aside>

//         {/* OVERLAY */}
//         {isMobileMenuOpen && (
//           <div
//             className="fixed inset-0 bg-black/50 z-30 md:hidden"
//             onClick={() => setIsMobileMenuOpen(false)}
//           />
//         )}

//         {/* MAIN CONTENT */}
//         <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-10 overflow-x-hidden">
//           <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-gray-200">
//             <h2 className="text-lg sm:text-2xl md:text-3xl font-bold uppercase tracking-wide text-primary leading-tight">
//               {tabLabel}
//             </h2>
//             <button
//               onClick={logout}
//               className="shrink-0 bg-primary text-secondary px-4 py-2 font-bold uppercase text-xs tracking-wider border border-transparent hover:bg-transparent hover:text-primary hover:border-primary transition-all duration-200"
//             >
//               Secure Logout
//             </button>
//           </header>

//           {loading ? (
//             <p className="text-gray-500 font-medium text-sm">Loading dashboard data...</p>
//           ) : (
//             <>
//               {activeTab === 'overview' && (
//                 <AdminOverview orders={orders} customers={customers} />
//               )}

//               {activeTab === 'orders' && (
//                 <AdminOrders orders={orders} onUpdateStatus={handleUpdateStatus} />
//               )}

//               {activeTab === 'customers' && (
//                 <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
//                   <div className="bg-white p-5 shadow-sm border border-gray-100 rounded lg:col-span-1 h-fit">
//                     <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">
//                       ➕ Register Account
//                     </h3>
//                     <Signup />
//                   </div>

//                   <div className="bg-white p-5 shadow-sm border border-gray-100 rounded lg:col-span-2 overflow-hidden">
//                     <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">
//                       👥 Platform Directory ({customers.length})
//                     </h3>
//                     <div className="overflow-x-auto -mx-5 px-5">
//                       <table className="w-full text-left text-sm min-w-[420px]">
//                         <thead>
//                           <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-xs bg-neutralBg">
//                             <th className="p-3">User</th>
//                             <th className="p-3">Email</th>
//                             <th className="p-3">Role</th>
//                             <th className="p-3 text-center">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {customers.map((c) => (
//                             <tr key={c._id || c.id} className="border-b border-gray-50 hover:bg-neutralBg/30 transition-colors">
//                               <td className="p-3 font-semibold text-primary">{c.name}</td>
//                               <td className="p-3 text-gray-600 text-xs break-all">{c.email}</td>
//                               <td className="p-3">
//                                 <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
//                                   c.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
//                                 }`}>
//                                   {c.role}
//                                 </span>
//                               </td>
//                               <td className="p-3 text-center">
//                                 {user.email !== c.email ? (
//                                   <button
//                                     onClick={() => handleDeleteUser(c._id || c.id, c.name)}
//                                     className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800 transition-colors px-2 py-1 rounded hover:bg-red-50"
//                                   >
//                                     🗑️ Delete
//                                   </button>
//                                 ) : (
//                                   <span className="text-xs italic text-gray-400 font-medium">You</span>
//                                 )}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;