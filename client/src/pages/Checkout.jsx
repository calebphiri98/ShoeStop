import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const subtotal = getCartTotal();
  const shippingFee = subtotal > 0 ? 15 : 0; 
  const orderTotal = subtotal + shippingFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setLoading(true);

    // Dynamic Payload Structure expected by orderController.js
    const orderPayload = {
      userId: user ? user.id : null, 
      totalAmount: orderTotal,
      shippingAddress: shippingAddress,
      whatsappNumber: whatsappNumber,
      cartItems: cart 
    };

    try {
      const response = await fetch('/api/orders', {
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

      // Format WhatsApp Tunnel Text for direct sales confirmation
      const itemSummary = cart.map(i => `• ${i.name} (x${i.quantity})`).join('%0A');
      const waMessage = `Hello ShoeStop! I just placed Order #${data.orderId}.%0A%0A*Items:*%0A${itemSummary}%0A%0A*Total:* $${orderTotal.toFixed(2)}%0A*Delivery:* ${shippingAddress}`;
      
      // Clear checkout state, then forward to WhatsApp transaction tunnel
      clearCart();
      window.open(`https://wa.me/995727978?text=${waMessage}`, '_blank');
      
      // Route user safely back to account portal tracking
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
    <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      {/* LEFT: Checkout Info Input */}
      <div className="lg:col-span-7 bg-white p-6 border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold uppercase tracking-wider text-primary mb-6">Delivery Details</h2>
        
        {!user && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 text-sm mb-6">
            Checking out as guest. <Link to="/login" className="underline font-bold">Login here</Link> to save this purchase to your permanent profile order tracking.
          </div>
        )}

        {errorMessage && <div className="bg-red-100 text-red-700 p-3 text-sm mb-4">{errorMessage}</div>}

        <form onSubmit={handlePlaceOrder} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Shipping Address</label>
            <textarea 
              required
              rows="3"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full border border-gray-300 p-3 focus:outline-none focus:border-primary resize-none"
              placeholder="Street Address, Apartment, Suite, City, Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textDark mb-1">Active WhatsApp Contact</label>
            <input 
              type="tel" 
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full border border-gray-300 p-3 focus:outline-none focus:border-primary"
              placeholder="+265..."
            />
          </div>

          <button 
            type="submit"
            disabled={loading || cart.length === 0}
            className="w-full bg-primary text-secondary py-4 font-bold uppercase tracking-wider hover:bg-black disabled:bg-gray-300 transition-colors"
          >
            {loading ? 'Processing Order...' : 'Complete Payment & Confirm Order'}
          </button>
        </form>
      </div>

      {/* RIGHT: Realtime Dynamic Receipt Summary */}
      <div className="lg:col-span-5 bg-neutralBg p-6 border border-gray-200 h-fit">
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
                  <span className="font-medium text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-4 text-sm text-textDark">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Premium Flat Shipping</span>
                <span>${shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-primary border-t border-gray-200 pt-2 mt-2">
                <span>Order Total</span>
                <span>${orderTotal.toFixed(2)}</span>
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
// import API_URL from '../config/api';

// const Checkout = () => {
//   const [step, setStep] = useState(1);
//   const { cart, total } = useCart();
//   const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

//   const handleWhatsAppOrder = () => {
//     // Format cart items for WhatsApp message
//     const orderDetails = cart.map(item => `${item.name} ($${item.price})`).join('%0A');
//     const message = `Hello ShoeStop & More! I would like to place an order:%0A%0A*Items:*%0A${orderDetails}%0A%0A*Total:* $${total}%0A%0A*My Details:*%0AName: ${formData.name}%0APhone: ${formData.phone}%0AAddress: ${formData.address}`;
    
//     // Replace with actual business WhatsApp number
//     const whatsappUrl = `https://wa.me/1234567890?text=${message}`;
//     window.open(whatsappUrl, '_blank');
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-4 py-12">
//       {/* Progress Bar */}
//       <div className="flex justify-between mb-12 border-b pb-4">
//         <span className={step >= 1 ? 'font-bold text-primary' : 'text-gray-400'}>1. Details</span>
//         <span className={step >= 2 ? 'font-bold text-primary' : 'text-gray-400'}>2. Delivery</span>
//         <span className={step >= 3 ? 'font-bold text-primary' : 'text-gray-400'}>3. Payment</span>
//       </div>

//       {step === 1 && (
//         <div className="space-y-4">
//           <h2 className="text-2xl font-bold mb-4">Customer Information</h2>
//           <input type="text" placeholder="Full Name" className="w-full border p-3" onChange={e => setFormData({...formData, name: e.target.value})} />
//           <input type="tel" placeholder="Phone Number" className="w-full border p-3" onChange={e => setFormData({...formData, phone: e.target.value})} />
//           <button onClick={() => setStep(2)} className="w-full bg-primary text-secondary py-4 font-bold uppercase mt-4">Continue to Delivery</button>
//         </div>
//       )}

//       {step === 2 && (
//         <div className="space-y-4">
//           <h2 className="text-2xl font-bold mb-4">Delivery Address</h2>
//           <textarea placeholder="Full Shipping Address" className="w-full border p-3 h-32" onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
//           <div className="flex gap-4">
//             <button onClick={() => setStep(1)} className="w-1/2 border border-primary text-primary py-4 font-bold uppercase">Back</button>
//             <button onClick={() => setStep(3)} className="w-1/2 bg-primary text-secondary py-4 font-bold uppercase">Continue to Payment</button>
//           </div>
//         </div>
//       )}

//       {step === 3 && (
//         <div>
//           <h2 className="text-2xl font-bold mb-4">Payment Options</h2>
//           <div className="bg-neutralBg p-6 mb-6">
//             <h3 className="font-bold mb-2">Order Summary</h3>
//             <p>Total: ${total.toFixed(2)}</p>
//           </div>
          
//           <div className="flex flex-col gap-4">
//             <button className="w-full bg-primary text-secondary py-4 font-bold uppercase">Pay Securely via Card</button>
//             <button 
//               onClick={handleWhatsAppOrder}
//               className="w-full bg-success text-white py-4 font-bold uppercase flex items-center justify-center gap-2"
//             >
//               Order via WhatsApp
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Checkout;
