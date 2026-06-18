import React, { useState } from 'react';

const AdminOrders = ({ orders, onUpdateStatus }) => {
  // Track loading state per individual order to keep the UI responsive
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId) {
      console.error("Cannot update status: Order ID is undefined or missing.");
      alert("Error: Missing order tracking reference ID.");
      return;
    }
    setUpdatingOrderId(orderId);
    try {
      // Execute the status patch pass-through handler
      await onUpdateStatus(orderId, newStatus);
    } catch (error) {
      console.error(`Failed to modify order status for #${orderId}:`, error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="bg-white p-6 shadow-sm border border-gray-100 rounded">
      {orders.length === 0 ? (
        <p className="text-gray-500 py-6 text-center tracking-wide text-sm">
          No client orders recorded on backend cluster.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[11px] tracking-wider bg-neutralBg/50">
                <th className="p-3">Order ID</th>
                <th className="p-3">Delivery Address</th>
                <th className="p-3">WhatsApp Connection</th>
                <th className="p-3">Items Amount</th>
                <th className="p-3 text-right">Tracking State Modifier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                // Safely resolve normalized database identifier syntax
                const currentOrderId = order.id || order._id;
                const isCurrentUpdating = updatingOrderId === currentOrderId;

                return (
                  <tr key={currentOrderId} className="hover:bg-neutralBg/20 transition-colors group">
                    <td className="p-3 font-bold text-primary tracking-tight">#{currentOrderId}</td>
                    <td className="p-3 font-medium text-gray-700 max-w-xs truncate">
                      {order.shipping_address}
                    </td>
                    <td className="p-3">
                      {order.whatsapp_number ? (
                        <a 
                          href={`https://wa.me/${order.whatsapp_number.toString().replace('+', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1 font-mono text-xs"
                        >
                          💬 +{order.whatsapp_number.toString().replace('+', '')}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 tracking-wide uppercase font-semibold">Unlinked</span>
                      )}
                    </td>
                    {/* 🪙 FIXED CURRENCY DISPLAY STRING -> TRANSITIONED FROM '$' TO 'MK' */}
                    <td className="p-3 font-mono font-bold text-primary whitespace-nowrap">
                      MK {Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        {isCurrentUpdating && (
                          <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        )}
                        <select 
                          value={order.status || "pending"} 
                          disabled={isCurrentUpdating}
                          onChange={(e) => handleStatusChange(currentOrderId, e.target.value)}
                          className={`border border-gray-300 p-1.5 text-xs font-bold uppercase bg-white focus:outline-none focus:border-primary text-primary transition-opacity ${
                            isCurrentUpdating ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                          }`}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="processing">⚙️ Processing</option>
                          <option value="shipped">🚚 Shipped</option>
                          <option value="delivered">✅ Delivered</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
// import React, { useState } from 'react';

// const AdminOrders = ({ orders, onUpdateStatus }) => {
//   // Track loading state per individual order to keep the UI responsive
//   const [updatingOrderId, setUpdatingOrderId] = useState(null);

//   const handleStatusChange = async (orderId, newStatus) => {
//     if (!orderId) {
//       console.error("Cannot update status: Order ID is undefined or missing.");
//       alert("Error: Missing order tracking reference ID.");
//       return;
//     }
//     setUpdatingOrderId(orderId);
//     try {
//       // Execute the status patch pass-through handler
//       await onUpdateStatus(orderId, newStatus);
//     } catch (error) {
//       console.error(`Failed to modify order status for #${orderId}:`, error);
//     } finally {
//       setUpdatingOrderId(null);
//     }
//   };

//   return (
//     <div className="bg-white p-6 shadow-sm border border-gray-100 rounded">
//       {orders.length === 0 ? (
//         <p className="text-gray-500 py-6 text-center tracking-wide text-sm">
//           No client orders recorded on backend cluster.
//         </p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm border-collapse">
//             <thead>
//               <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[11px] tracking-wider bg-neutralBg/50">
//                 <th className="p-3">Order ID</th>
//                 <th className="p-3">Delivery Address</th>
//                 <th className="p-3">WhatsApp Connection</th>
//                 <th className="p-3">Items Amount</th>
//                 <th className="p-3 text-right">Tracking State Modifier</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {orders.map((order) => {
//                 // Safely resolve normalized database identifier syntax
//                 const currentOrderId = order.id || order._id;
//                 const isCurrentUpdating = updatingOrderId === currentOrderId;

//                 return (
//                   <tr key={currentOrderId} className="hover:bg-neutralBg/20 transition-colors group">
//                     <td className="p-3 font-bold text-primary tracking-tight">#{currentOrderId}</td>
//                     <td className="p-3 font-medium text-gray-700 max-w-xs truncate">
//                       {order.shipping_address}
//                     </td>
//                     <td className="p-3">
//                       {order.whatsapp_number ? (
//                         <a 
//                           href={`https://wa.me/${order.whatsapp_number.toString().replace('+', '')}`} 
//                           target="_blank" 
//                           rel="noopener noreferrer" 
//                           className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1 font-mono text-xs"
//                         >
//                           💬 +{order.whatsapp_number.toString().replace('+', '')}
//                         </a>
//                       ) : (
//                         <span className="text-xs text-gray-400 tracking-wide uppercase font-semibold">Unlinked</span>
//                       )}
//                     </td>
//                     <td className="p-3 font-mono font-bold text-primary">
//                       ${Number(order.total_amount).toFixed(2)}
//                     </td>
//                     <td className="p-3 text-right">
//                       <div className="inline-flex items-center gap-2 justify-end">
//                         {isCurrentUpdating && (
//                           <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
//                         )}
//                         <select 
//                           value={order.status || "pending"} 
//                           disabled={isCurrentUpdating}
//                           onChange={(e) => handleStatusChange(currentOrderId, e.target.value)}
//                           className={`border border-gray-300 p-1.5 text-xs font-bold uppercase bg-white focus:outline-none focus:border-primary text-primary transition-opacity ${
//                             isCurrentUpdating ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
//                           }`}
//                         >
//                           <option value="pending">⏳ Pending</option>
//                           <option value="processing">⚙️ Processing</option>
//                           <option value="shipped">🚚 Shipped</option>
//                           <option value="delivered">✅ Delivered</option>
//                           <option value="cancelled">❌ Cancelled</option>
//                         </select>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminOrders;
