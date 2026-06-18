import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

// Subcomponent imports matching your project structure
import AdminOverview from '../components/admin/AdminOverview';
import AdminOrders from '../components/admin/AdminOrders';
import Signup from './Signup'; // Direct reference to your existing Signup page component

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Navigation Routing Tab State
  const [activeTab, setActiveTab] = useState('overview');

  // Real Database States
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Middleware Response Validator
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

  // Fetch Dashboard Database Pipelines
  const fetchDashboardData = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      // Fetch Orders
      const resOrders = await fetch(`${API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const dataOrders = await handleResponse(resOrders);
      setOrders(Array.isArray(dataOrders) ? dataOrders : []);

      // Fetch Users/Customers
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

  // Track and Update Order Lifecycle State
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      await handleResponse(response);
      alert(`Order #${orderId} set to ${newStatus}`);
      fetchDashboardData(); // Refresh list data
    } catch (err) {
      alert(err.message);
    }
  };

  // Administrative User Deletion Pipeline
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you absolutely sure you want to completely remove ${userName}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      await handleResponse(response);
      alert(`Successfully purged ${userName} from the core system directories.`);
      fetchDashboardData(); // Refresh active user state tracking mappings
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-neutralBg font-sans">
      
      {/* SIDEBAR COMPONENT PANEL */}
      <aside className="w-64 bg-primary text-secondary flex flex-col justify-between p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-accent uppercase mb-10 border-b border-accent/20 pb-4">ShoeStop Admin</h1>
          <nav className="space-y-2 text-sm uppercase tracking-wider font-semibold">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${activeTab === 'overview' ? 'bg-accent text-primary font-bold' : 'hover:bg-accent/10 hover:text-accent'}`}
            >
              📊 Overview
            </button>
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${activeTab === 'orders' ? 'bg-accent text-primary font-bold' : 'hover:bg-accent/10 hover:text-accent'}`}
            >
              📦 Track Orders ({orders.length})
            </button>
            <button 
              onClick={() => setActiveTab('customers')} 
              className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${activeTab === 'customers' ? 'bg-accent text-primary font-bold' : 'hover:bg-accent/10 hover:text-accent'}`}
            >
              👥 Manage Users
            </button>
          </nav>
        </div>
        <div className="text-xs text-gray-400 font-medium">Logged in as Admin: <span className="text-white block mt-1">{user.email}</span></div>
      </aside>

      {/* CORE WORKSPACE ENTRY CONTAINER */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10 pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-bold uppercase tracking-wide text-primary">
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'orders' && 'Order Lifecycle Management'}
            {activeTab === 'customers' && 'Account Provisioning & Users'}
          </h2>
          <button onClick={logout} className="bg-primary text-secondary px-5 py-2 font-bold uppercase text-xs tracking-wider border border-transparent hover:bg-transparent hover:text-primary hover:border-primary transition-all duration-200">
            Secure Logout
          </button>
        </header>

        {loading ? (
          <p className="text-gray-500 font-medium">Synchronizing backoffice relational matrices...</p>
        ) : (
          <>
            {/* VIEW A: OVERVIEW METRIC SUMMARY SUBCOMPONENT */}
            {activeTab === 'overview' && (
              <AdminOverview orders={orders} customers={customers} />
            )}

            {/* VIEW B: FULL ORDER MANAGEMENT PIPELINE SUBCOMPONENT */}
            {activeTab === 'orders' && (
              <AdminOrders orders={orders} onUpdateStatus={handleUpdateStatus} />
            )}

            {/* VIEW C: MANAGE USERS SPLIT INTERFACE DEPLOYMENT */}
            {activeTab === 'customers' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: SHARED SIGNUP UTILITY INLINE INJECT */}
                <div className="bg-white p-6 shadow-sm border border-gray-100 lg:col-span-1 h-fit rounded">
                  <h3 className="text-md font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-100 pb-2">➕ Register Account</h3>
                  <Signup />
                </div>

                {/* RIGHT COLUMN: COMPLETE ACTIVE USERS PLATFORM DIRECTORY */}
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
                          <th className="p-3">Role Scope</th>
                          <th className="p-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((c) => (
                          <tr key={c._id || c.id} className="border-b border-gray-50 hover:bg-neutralBg/30 transition-colors">
                            <td className="p-3 font-semibold text-primary">{c.name}</td>
                            <td className="p-3 text-gray-600">{c.email}</td>
                            <td className="p-3">
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${c.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                {c.role}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {/* Preventive constraint so logged-in admin doesn't delete themselves */}
                              {user.email !== c.email ? (
                                <button
                                  onClick={() => handleDeleteUser(c._id || c.id, c.name)}
                                  className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800 transition-colors px-2 py-1 rounded hover:bg-red-50"
                                >
                                  🗑️ Delete
                                </button>
                              ) : (
                                <span className="text-xs italic text-gray-400 font-medium">Current Session</span>
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
  );
};

export default AdminDashboard;


// import React, { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import API_URL from '../config/api';

// // Subcomponent imports matching your project structure
// import AdminOverview from '../components/admin/AdminOverview';
// import AdminOrders from '../components/admin/AdminOrders';
// import Signup from './Signup'; // Direct reference to your existing Signup page component

// const AdminDashboard = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
  
//   // Navigation Routing Tab State
//   const [activeTab, setActiveTab] = useState('overview');

//   // Real Database States
//   const [orders, setOrders] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Middleware Response Validator
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
//     try {
//       const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${user.token}`
//         },
//         body: JSON.stringify({ status: newStatus })
//       });
//       await handleResponse(response);
//       alert(`Order #${orderId} set to ${newStatus}`);
//       fetchDashboardData(); // Refresh list data
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   if (!user) return null;

//   return (
//     <div className="flex min-h-screen bg-neutralBg font-sans">
      
//       {/* SIDEBAR COMPONENT PANEL */}
//       <aside className="w-64 bg-primary text-secondary flex flex-col justify-between p-6 shadow-xl">
//         <div>
//           <h1 className="text-2xl font-bold tracking-widest text-accent uppercase mb-10 border-b border-accent/20 pb-4">ShoeStop Admin</h1>
//           <nav className="space-y-2 text-sm uppercase tracking-wider font-semibold">
//             <button 
//               onClick={() => setActiveTab('overview')} 
//               className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${activeTab === 'overview' ? 'bg-accent text-primary font-bold' : 'hover:bg-accent/10 hover:text-accent'}`}
//             >
//               📊 Overview
//             </button>
//             <button 
//               onClick={() => setActiveTab('orders')} 
//               className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${activeTab === 'orders' ? 'bg-accent text-primary font-bold' : 'hover:bg-accent/10 hover:text-accent'}`}
//             >
//               📦 Track Orders ({orders.length})
//             </button>
//             <button 
//               onClick={() => setActiveTab('customers')} 
//               className={`w-full text-left px-4 py-3 rounded transition-all duration-200 ${activeTab === 'customers' ? 'bg-accent text-primary font-bold' : 'hover:bg-accent/10 hover:text-accent'}`}
//             >
//               👥 Manage Users
//             </button>
//           </nav>
//         </div>
//         <div className="text-xs text-gray-400 font-medium">Logged in as Admin: <span className="text-white block mt-1">{user.email}</span></div>
//       </aside>

//       {/* CORE WORKSPACE ENTRY CONTAINER */}
//       <main className="flex-1 p-10 overflow-y-auto">
//         <header className="flex justify-between items-center mb-10 pb-4 border-b border-gray-200">
//           <h2 className="text-3xl font-bold uppercase tracking-wide text-primary">
//             {activeTab === 'overview' && 'Dashboard Overview'}
//             {activeTab === 'orders' && 'Order Lifecycle Management'}
//             {activeTab === 'customers' && 'Account Provisioning & Users'}
//           </h2>
//           <button onClick={logout} className="bg-primary text-secondary px-5 py-2 font-bold uppercase text-xs tracking-wider border border-transparent hover:bg-transparent hover:text-primary hover:border-primary transition-all duration-200">
//             Secure Logout
//           </button>
//         </header>

//         {loading ? (
//           <p className="text-gray-500 font-medium">Synchronizing backoffice relational matrices...</p>
//         ) : (
//           <>
//             {/* VIEW A: OVERVIEW METRIC SUMMARY SUBCOMPONENT */}
//             {activeTab === 'overview' && (
//               <AdminOverview orders={orders} customers={customers} />
//             )}

//             {/* VIEW B: FULL ORDER MANAGEMENT PIPELINE SUBCOMPONENT */}
//             {activeTab === 'orders' && (
//               <AdminOrders orders={orders} onUpdateStatus={handleUpdateStatus} />
//             )}

//             {/* VIEW C: MANAGE USERS DIRECTLY RENDERED FROM THE SIGNUP PAGE COMPONENT */}
//             {activeTab === 'customers' && (
//               <div className="bg-white p-6 shadow-sm border border-gray-100 rounded">
//                 <Signup />
//               </div>
//             )}
//           </>
//         )}
//       </main>
//     </div>
//   );
// };

// export default AdminDashboard;
