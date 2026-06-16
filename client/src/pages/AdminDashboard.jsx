import React from 'react';


const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-primary text-secondary p-6">
        <h1 className="text-2xl font-bold mb-10 text-accent">ShoeStop Admin</h1>
        <nav className="space-y-4">
          <a href="#overview" className="block py-2 hover:text-accent transition-colors">Overview</a>
          <a href="#products" className="block py-2 hover:text-accent transition-colors">Products & Inventory</a>
          <a href="#orders" className="block py-2 hover:text-accent transition-colors">Orders</a>
          <a href="#customers" className="block py-2 hover:text-accent transition-colors">Customers</a>
          <a href="#settings" className="block py-2 hover:text-accent transition-colors">Settings</a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-textDark">Dashboard Overview</h2>
          <button className="bg-primary text-secondary px-4 py-2 rounded">Logout</button>
        </header>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 uppercase text-xs font-bold mb-1">Total Revenue</p>
            <h3 className="text-3xl font-bold text-primary">$45,231.00</h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 uppercase text-xs font-bold mb-1">Active Orders</p>
            <h3 className="text-3xl font-bold text-primary">124</h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 uppercase text-xs font-bold mb-1">Low Stock Alerts</p>
            <h3 className="text-3xl font-bold text-red-500">7 Products</h3>
          </div>
        </div>

        {/* Recent Orders Table Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">#1024</td>
                <td className="py-3">Jane Doe</td>
                <td className="py-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full">Pending</span></td>
                <td className="py-3">$149.99</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;