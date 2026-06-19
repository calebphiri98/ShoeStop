import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
// 🛠️ FIX 1: Import the base URL mapping configuration
import API_URL from '../config/api';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const subtotal = getCartTotal();
  const shippingFee = subtotal > 0 ? 2500 : 0; 
  const orderTotal = subtotal + shippingFee;

  const formatCurrency = (priceValue) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0
    })
    .format(priceValue)
    .replace('MWK', 'MK'); 
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setLoading(true);

    const orderPayload = {
      userId: user ? user.id : null, 
      totalAmount: orderTotal,
      shippingAddress: shippingAddress,
      whatsappNumber: whatsappNumber,
      cartItems: cart 
    };

    try {
      // 🛠️ FIX 2: Prepend ${API_URL} so requests route directly to Render instead of Vercel
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${user.token}` })
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync your checkout data.');
      }

      const itemSummary = cart.map(i => `• ${i.name} (x${i.quantity})`).join('%0A');
      const waMessage = `Hello ShoeStop! I just placed Order #${data.orderId}.%0A%0A*Items:*%0A${itemSummary}%0A%0A*Total:* ${formatCurrency(orderTotal)}%0A*Delivery:* ${shippingAddress}`;
      
      clearCart();
      window.open(`https://wa.me/265995727978?text=${waMessage}`, '_blank');
      
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-10 items-start">
      
      {/* MOBILE ONLY: Dynamic Top Accordion Cart Dropdown Summary Bar */}
      <div className="block lg:hidden w-full bg-neutralBg border border-gray-200 p-3 shadow-xs">
        <button 
          onClick={() => setShowMobileSummary(!showMobileSummary)}
          className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-primary"
        >
          <div className="flex items-center gap-2">
            <span>🛒 View Order Summary</span>
            <span className="bg-primary text-secondary text-[10px] px-1.5 py-0.5 rounded-full">{cart.reduce((t, i) => t + i.quantity, 0)}</span>
          </div>
          <span className="text-sm font-black text-primary">
            {showMobileSummary ? 'Hide ↑' : `${formatCurrency(orderTotal)} ↓`}
          </span>
        </button>

        {showMobileSummary && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-3 animate-fade-in">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-primary block">{item.name}</span>
                  <span className="text-gray-400 text-[10px]">Qty: {item.quantity}</span>
                </div>
                <span className="font-medium text-primary text-right whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200 space-y-1 text-[11px] text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Delivery</span>
                <span>{formatCurrency(shippingFee)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LEFT: Delivery form entries */}
      <div className="lg:col-span-7 bg-white p-4 sm:p-6 border border-gray-100 shadow-sm order-2 lg:order-1">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-primary mb-4 md:mb-6">Delivery Details</h2>
        
        {!user && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 text-xs mb-5 rounded-none leading-relaxed">
            Checking out as guest. <Link to="/login" className="underline font-bold text-primary">Login here</Link> to automatically save order history tracking parameters.
          </div>
        )}

        {errorMessage && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-xs mb-4 font-medium">{errorMessage}</div>}

        <form onSubmit={handlePlaceOrder} className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-textDark mb-1">Shipping Address</label>
            <textarea 
              required
              rows="3"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-primary resize-none rounded-none placeholder:text-gray-300"
              placeholder="Area Name / Street, House or Apartment Number, City"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-textDark mb-1">Active WhatsApp Contact</label>
            <input 
              type="tel" 
              inputMode="tel" 
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-primary rounded-none placeholder:text-gray-300"
              placeholder="e.g. +265995727978"
            />
            <p className="text-[10px] text-gray-400 mt-1">Required to forward confirmation logs via WhatsApp channels.</p>
          </div>

          <button 
            type="submit"
            disabled={loading || cart.length === 0}
            className="w-full bg-primary text-secondary py-3.5 md:py-4 font-bold uppercase text-xs tracking-widest hover:bg-black disabled:bg-gray-200 transition-colors duration-150 active:scale-[0.99] shadow-xs"
          >
            {loading ? 'Processing Securely...' : 'Confirm Order via WhatsApp 💬'}
          </button>
        </form>
      </div>

      {/* DESKTOP ONLY: Sidebar Summary display Panel */}
      <div className="hidden lg:block lg:col-span-5 bg-neutralBg p-6 border border-gray-200 h-fit order-2">
        <h3 className="text-lg font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-200 pb-2">Bag Summary</h3>
        
        {cart.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">Your fashion catalog bag is currently empty.</p>
        ) : (
          <>
            <div className="space-y-4 max-h-64 overflow-y-auto mb-6 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-semibold text-primary">{item.name}</span>
                    <span className="text-gray-400 block text-xs">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-medium text-primary ml-4 shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-4 text-sm text-textDark">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Premium Flat Shipping</span>
                <span className="font-medium">{formatCurrency(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-primary border-t border-gray-200 pt-2 mt-2">
                <span>Order Total</span>
                <span>{formatCurrency(orderTotal)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;

// import React, { useState } from 'react';
// import { useCart } from '../context/CartContext';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';

// const Checkout = () => {
//   const { cart, getCartTotal, clearCart } = useCart();
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const [shippingAddress, setShippingAddress] = useState('');
//   const [whatsappNumber, setWhatsappNumber] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [showMobileSummary, setShowMobileSummary] = useState(false); // Mobile toggle summary handle

//   const subtotal = getCartTotal();
//   // Adjusted to realistic standard MK local shipping structures if needed, keeping your core logic
//   const shippingFee = subtotal > 0 ? 2500 : 0; 
//   const orderTotal = subtotal + shippingFee;

//   const formatCurrency = (priceValue) => {
//     return new Intl.NumberFormat('en-MW', {
//       style: 'currency',
//       currency: 'MWK',
//       minimumFractionDigits: 0
//     })
//     .format(priceValue)
//     .replace('MWK', 'MK'); 
//   };

//   const handlePlaceOrder = async (e) => {
//     e.preventDefault();
//     setErrorMessage('');

//     if (cart.length === 0) {
//       setErrorMessage('Your cart is empty.');
//       return;
//     }

//     setLoading(true);

//     const orderPayload = {
//       userId: user ? user.id : null, 
//       totalAmount: orderTotal,
//       shippingAddress: shippingAddress,
//       whatsappNumber: whatsappNumber,
//       cartItems: cart 
//     };

//     try {
//       const response = await fetch('/api/orders', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           ...(user && { 'Authorization': `Bearer ${user.token}` })
//         },
//         body: JSON.stringify(orderPayload),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to sync your checkout data.');
//       }

//       const itemSummary = cart.map(i => `• ${i.name} (x${i.quantity})`).join('%0A');
//       const waMessage = `Hello ShoeStop! I just placed Order #${data.orderId}.%0A%0A*Items:*%0A${itemSummary}%0A%0A*Total:* ${formatCurrency(orderTotal)}%0A*Delivery:* ${shippingAddress}`;
      
//       clearCart();
//       window.open(`https://wa.me/265995727978?text=${waMessage}`, '_blank');
      
//       if (user) {
//         navigate('/dashboard');
//       } else {
//         navigate('/');
//       }
//     } catch (err) {
//       setErrorMessage(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-10 items-start">
      
//       {/* MOBILE ONLY: Dynamic Top Accordion Cart Dropdown Summary Bar */}
//       <div className="block lg:hidden w-full bg-neutralBg border border-gray-200 p-3 shadow-xs">
//         <button 
//           onClick={() => setShowMobileSummary(!showMobileSummary)}
//           className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-primary"
//         >
//           <div className="flex items-center gap-2">
//             <span>🛒 View Order Summary</span>
//             <span className="bg-primary text-secondary text-[10px] px-1.5 py-0.5 rounded-full">{cart.reduce((t, i) => t + i.quantity, 0)}</span>
//           </div>
//           <span className="text-sm font-black text-primary">
//             {showMobileSummary ? 'Hide ↑' : `${formatCurrency(orderTotal)} ↓`}
//           </span>
//         </button>

//         {showMobileSummary && (
//           <div className="mt-3 pt-3 border-t border-gray-200 space-y-3 animate-fade-in">
//             {cart.map((item) => (
//               <div key={item.id} className="flex justify-between items-center text-xs">
//                 <div>
//                   <span className="font-semibold text-primary block">{item.name}</span>
//                   <span className="text-gray-400 text-[10px]">Qty: {item.quantity}</span>
//                 </div>
//                 <span className="font-medium text-primary text-right whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</span>
//               </div>
//             ))}
//             <div className="pt-2 border-t border-gray-200 space-y-1 text-[11px] text-gray-600">
//               <div className="flex justify-between">
//                 <span>Subtotal</span>
//                 <span>{formatCurrency(subtotal)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Standard Delivery</span>
//                 <span>{formatCurrency(shippingFee)}</span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* LEFT: Delivery form entries */}
//       <div className="lg:col-span-7 bg-white p-4 sm:p-6 border border-gray-100 shadow-sm order-2 lg:order-1">
//         <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-primary mb-4 md:mb-6">Delivery Details</h2>
        
//         {!user && (
//           <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 text-xs mb-5 rounded-none leading-relaxed">
//             Checking out as guest. <Link to="/login" className="underline font-bold text-primary">Login here</Link> to automatically save order history tracking parameters.
//           </div>
//         )}

//         {errorMessage && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-xs mb-4 font-medium">{errorMessage}</div>}

//         <form onSubmit={handlePlaceOrder} className="space-y-4 md:space-y-6">
//           <div>
//             <label className="block text-xs font-bold uppercase tracking-wider text-textDark mb-1">Shipping Address</label>
//             <textarea 
//               required
//               rows="3"
//               value={shippingAddress}
//               onChange={(e) => setShippingAddress(e.target.value)}
//               className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-primary resize-none rounded-none placeholder:text-gray-300"
//               placeholder="Area Name / Street, House or Apartment Number, City"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-bold uppercase tracking-wider text-textDark mb-1">Active WhatsApp Contact</label>
//             <input 
//               type="tel" 
//               inputMode="tel" // Pulls up native phone number pad on smartphones instantly
//               required
//               value={whatsappNumber}
//               onChange={(e) => setWhatsappNumber(e.target.value)}
//               className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-primary rounded-none placeholder:text-gray-300"
//               placeholder="e.g. +265995727978"
//             />
//             <p className="text-[10px] text-gray-400 mt-1">Required to forward confirmation logs via WhatsApp channels.</p>
//           </div>

//           {/* Large tap target CTA button */}
//           <button 
//             type="submit"
//             disabled={loading || cart.length === 0}
//             className="w-full bg-primary text-secondary py-3.5 md:py-4 font-bold uppercase text-xs tracking-widest hover:bg-black disabled:bg-gray-200 transition-colors duration-150 active:scale-[0.99] shadow-xs"
//           >
//             {loading ? 'Processing Securely...' : 'Confirm Order via WhatsApp 💬'}
//           </button>
//         </form>
//       </div>

//       {/* DESKTOP ONLY: Sidebar Summary display Panel */}
//       <div className="hidden lg:block lg:col-span-5 bg-neutralBg p-6 border border-gray-200 h-fit order-2">
//         <h3 className="text-lg font-bold uppercase tracking-wide text-primary mb-4 border-b border-gray-200 pb-2">Bag Summary</h3>
        
//         {cart.length === 0 ? (
//           <p className="text-sm text-gray-500 py-4">Your fashion catalog bag is currently empty.</p>
//         ) : (
//           <>
//             <div className="space-y-4 max-h-64 overflow-y-auto mb-6 pr-1">
//               {cart.map((item) => (
//                 <div key={item.id} className="flex justify-between items-center text-sm">
//                   <div>
//                     <span className="font-semibold text-primary">{item.name}</span>
//                     <span className="text-gray-400 block text-xs">Qty: {item.quantity}</span>
//                   </div>
//                   <span className="font-medium text-primary ml-4 shrink-0">{formatCurrency(item.price * item.quantity)}</span>
//                 </div>
//               ))}
//             </div>

//             <div className="space-y-2 border-t border-gray-200 pt-4 text-sm text-textDark">
//               <div className="flex justify-between">
//                 <span>Subtotal</span>
//                 <span className="font-medium">{formatCurrency(subtotal)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Premium Flat Shipping</span>
//                 <span className="font-medium">{formatCurrency(shippingFee)}</span>
//               </div>
//               <div className="flex justify-between text-base font-black text-primary border-t border-gray-200 pt-2 mt-2">
//                 <span>Order Total</span>
//                 <span>{formatCurrency(orderTotal)}</span>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Checkout;
