import React from 'react';

const AdminOrders = ({ orders, onUpdateStatus }) => {
  return (
    <div className="bg-white p-6 shadow-sm border border-gray-100">
      {orders.length === 0 ? (
        <p className="text-gray-500 py-6 text-center">No client orders recorded on backend cluster.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-xs bg-neutralBg">
                <th className="p-3">Order ID</th>
                <th className="p-3">Delivery Address</th>
                <th className="p-3">WhatsApp Connection</th>
                <th className="p-3">Items Amount</th>
                <th className="p-3">Tracking State Modifier</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-neutralBg/30 transition-colors">
                  <td className="p-3 font-bold text-primary">#{order.id}</td>
                  <td className="p-3 font-medium text-gray-700">{order.shipping_address}</td>
                  <td className="p-3">
                    <a href={`https://wa.me/${order.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="text-success font-bold hover:underline">
                      💬 {order.whatsapp_number || 'No link'}
                    </a>
                  </td>
                  <td className="p-3 font-bold text-primary">${Number(order.total_amount).toFixed(2)}</td>
                  <td className="p-3">
                    <select 
                      value={order.status} 
                      onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                      className="border border-gray-300 p-1.5 text-xs font-bold uppercase bg-white focus:outline-none focus:border-primary text-primary"
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="processing">⚙️ Processing</option>
                      <option value="shipped">🚚 Shipped</option>
                      <option value="delivered">✅ Delivered</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
