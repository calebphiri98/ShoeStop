

import React from 'react';

const AdminOverview = ({ orders, customers }) => {
  // Analytical Matrix Computations
  const computedRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-1">Gross Shop Revenue</p>
          <h3 className="text-3xl font-bold text-primary">${computedRevenue.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-1">Active Pipeline Orders</p>
          <h3 className="text-3xl font-bold text-primary">{activeOrdersCount}</h3>
        </div>
        <div className="bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-1">Registered Platform Accounts</p>
          <h3 className="text-3xl font-bold text-primary">{customers.length} Users</h3>
        </div>
      </div>

      {/* mini recent summaries layout */}
      <div className="bg-white p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold uppercase text-primary tracking-wide mb-4">Recent Sales Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-textDark">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-xs bg-neutralBg">
                <th className="p-3">ID</th>
                <th className="p-3">Address</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-neutralBg/50 transition-colors">
                  <td className="p-3 font-bold text-primary">#{order.id}</td>
                  <td className="p-3 truncate max-w-xs">{order.shipping_address}</td>
                  <td className="p-3 font-semibold">${Number(order.total_amount).toFixed(2)}</td>
                  <td className="p-3">
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 font-bold uppercase rounded">
                      {order.status}
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

export default AdminOverview;
