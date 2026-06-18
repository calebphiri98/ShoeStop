
import React from 'react';

const AdminOverview = ({ orders, customers }) => {
  const computedRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* STAT CARDS — 2-up on small phones so the first screen shows real data immediately, 3-up from sm breakpoint */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 shadow-sm border border-gray-100 rounded-lg col-span-2 sm:col-span-1">
          <p className="text-gray-400 uppercase text-[10px] sm:text-[11px] font-bold tracking-wider mb-1.5 sm:mb-2">Gross Shop Revenue</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-primary">${computedRevenue.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-4 sm:p-5 shadow-sm border border-gray-100 rounded-lg">
          <p className="text-gray-400 uppercase text-[10px] sm:text-[11px] font-bold tracking-wider mb-1.5 sm:mb-2">Active Orders</p>
          <h3 className="text-xl sm:text-3xl font-bold text-primary">{activeOrdersCount}</h3>
        </div>
        <div className="bg-white p-4 sm:p-5 shadow-sm border border-gray-100 rounded-lg">
          <p className="text-gray-400 uppercase text-[10px] sm:text-[11px] font-bold tracking-wider mb-1.5 sm:mb-2">Accounts</p>
          <h3 className="text-xl sm:text-3xl font-bold text-primary">{customers.length}</h3>
        </div>
      </div>

      {/* RECENT SALES */}
      <div className="bg-white p-4 sm:p-5 shadow-sm border border-gray-100 rounded-lg">
        <h3 className="text-sm font-bold uppercase text-primary tracking-wide mb-3 sm:mb-4">Recent Sales Registry</h3>

        {/* MOBILE: card stack, big tap-friendly rows, no horizontal scroll */}
        <div className="sm:hidden space-y-2.5">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="border border-gray-100 rounded-lg p-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-primary text-sm">#{order.id}</span>
                <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{order.shipping_address}</p>
              <p className="text-sm font-semibold text-primary mt-1">${Number(order.total_amount).toFixed(2)}</p>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No orders yet.</p>
          )}
        </div>

        {/* DESKTOP / TABLET: table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm">
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
                    <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-400 text-sm">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
// // import React from 'react';

// // const AdminOverview = ({ orders, customers }) => {
// //   // Analytical Matrix Computations
// //   const computedRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
// //   const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

// //   return (
// //     <div className="space-y-10">
// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //         <div className="bg-white p-6 shadow-sm border border-gray-100">
// //           <p className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-1">Gross Shop Revenue</p>
// //           <h3 className="text-3xl font-bold text-primary">${computedRevenue.toFixed(2)}</h3>
// //         </div>
// //         <div className="bg-white p-6 shadow-sm border border-gray-100">
// //           <p className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-1">Active Pipeline Orders</p>
// //           <h3 className="text-3xl font-bold text-primary">{activeOrdersCount}</h3>
// //         </div>
// //         <div className="bg-white p-6 shadow-sm border border-gray-100">
// //           <p className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-1">Registered Platform Accounts</p>
// //           <h3 className="text-3xl font-bold text-primary">{customers.length} Users</h3>
// //         </div>
// //       </div>

// //       {/* mini recent summaries layout */}
// //       <div className="bg-white p-6 shadow-sm border border-gray-100">
// //         <h3 className="text-lg font-bold uppercase text-primary tracking-wide mb-4">Recent Sales Registry</h3>
// //         <div className="overflow-x-auto">
// //           <table className="w-full text-left text-sm text-textDark">
// //             <thead>
// //               <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-xs bg-neutralBg">
// //                 <th className="p-3">ID</th>
// //                 <th className="p-3">Address</th>
// //                 <th className="p-3">Total</th>
// //                 <th className="p-3">Status</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {orders.slice(0, 5).map((order) => (
// //                 <tr key={order.id} className="border-b border-gray-50 hover:bg-neutralBg/50 transition-colors">
// //                   <td className="p-3 font-bold text-primary">#{order.id}</td>
// //                   <td className="p-3 truncate max-w-xs">{order.shipping_address}</td>
// //                   <td className="p-3 font-semibold">${Number(order.total_amount).toFixed(2)}</td>
// //                   <td className="p-3">
// //                     <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 font-bold uppercase rounded">
// //                       {order.status}
// //                     </span>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AdminOverview;

// import React from 'react';

// const AdminOverview = ({ orders, customers }) => {
//   const computedRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
//   const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

//   const statusColors = {
//     pending: 'bg-amber-100 text-amber-800',
//     processing: 'bg-blue-100 text-blue-800',
//     shipped: 'bg-purple-100 text-purple-800',
//     delivered: 'bg-green-100 text-green-800',
//     cancelled: 'bg-red-100 text-red-800',
//   };

//   return (
//     <div className="space-y-6">

//       {/* STAT CARDS — single column on mobile, 3 cols on desktop */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <div className="bg-white p-5 shadow-sm border border-gray-100 rounded">
//           <p className="text-gray-400 uppercase text-[11px] font-bold tracking-wider mb-2">Gross Shop Revenue</p>
//           <h3 className="text-2xl sm:text-3xl font-bold text-primary">${computedRevenue.toFixed(2)}</h3>
//         </div>
//         <div className="bg-white p-5 shadow-sm border border-gray-100 rounded">
//           <p className="text-gray-400 uppercase text-[11px] font-bold tracking-wider mb-2">Active Pipeline Orders</p>
//           <h3 className="text-2xl sm:text-3xl font-bold text-primary">{activeOrdersCount}</h3>
//         </div>
//         <div className="bg-white p-5 shadow-sm border border-gray-100 rounded">
//           <p className="text-gray-400 uppercase text-[11px] font-bold tracking-wider mb-2">Registered Platform Accounts</p>
//           <h3 className="text-2xl sm:text-3xl font-bold text-primary">{customers.length} Users</h3>
//         </div>
//       </div>

//       {/* RECENT SALES TABLE */}
//       <div className="bg-white p-5 shadow-sm border border-gray-100 rounded">
//         <h3 className="text-sm font-bold uppercase text-primary tracking-wide mb-4">Recent Sales Registry</h3>

//         {/* MOBILE: card stack */}
//         <div className="sm:hidden space-y-3">
//           {orders.slice(0, 5).map((order) => (
//             <div key={order.id} className="border border-gray-100 rounded p-4 space-y-2">
//               <div className="flex justify-between items-center">
//                 <span className="font-bold text-primary text-sm">#{order.id}</span>
//                 <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
//                   {order.status}
//                 </span>
//               </div>
//               <p className="text-xs text-gray-500 truncate">{order.shipping_address}</p>
//               <p className="text-sm font-semibold text-primary">${Number(order.total_amount).toFixed(2)}</p>
//             </div>
//           ))}
//           {orders.length === 0 && (
//             <p className="text-sm text-gray-400 text-center py-4">No orders yet.</p>
//           )}
//         </div>

//         {/* DESKTOP: table */}
//         <div className="hidden sm:block overflow-x-auto">
//           <table className="w-full text-left text-sm">
//             <thead>
//               <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-xs bg-neutralBg">
//                 <th className="p-3">ID</th>
//                 <th className="p-3">Address</th>
//                 <th className="p-3">Total</th>
//                 <th className="p-3">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.slice(0, 5).map((order) => (
//                 <tr key={order.id} className="border-b border-gray-50 hover:bg-neutralBg/50 transition-colors">
//                   <td className="p-3 font-bold text-primary">#{order.id}</td>
//                   <td className="p-3 truncate max-w-xs">{order.shipping_address}</td>
//                   <td className="p-3 font-semibold">${Number(order.total_amount).toFixed(2)}</td>
//                   <td className="p-3">
//                     <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
//                       {order.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//               {orders.length === 0 && (
//                 <tr>
//                   <td colSpan={4} className="p-4 text-center text-gray-400 text-sm">No orders yet.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminOverview;