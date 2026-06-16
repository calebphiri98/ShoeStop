import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import API_URL from '../config/api';

const Checkout = () => {
  const [step, setStep] = useState(1);
  const { cart, total } = useCart();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const handleWhatsAppOrder = () => {
    // Format cart items for WhatsApp message
    const orderDetails = cart.map(item => `${item.name} ($${item.price})`).join('%0A');
    const message = `Hello ShoeStop & More! I would like to place an order:%0A%0A*Items:*%0A${orderDetails}%0A%0A*Total:* $${total}%0A%0A*My Details:*%0AName: ${formData.name}%0APhone: ${formData.phone}%0AAddress: ${formData.address}`;
    
    // Replace with actual business WhatsApp number
    const whatsappUrl = `https://wa.me/1234567890?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress Bar */}
      <div className="flex justify-between mb-12 border-b pb-4">
        <span className={step >= 1 ? 'font-bold text-primary' : 'text-gray-400'}>1. Details</span>
        <span className={step >= 2 ? 'font-bold text-primary' : 'text-gray-400'}>2. Delivery</span>
        <span className={step >= 3 ? 'font-bold text-primary' : 'text-gray-400'}>3. Payment</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Customer Information</h2>
          <input type="text" placeholder="Full Name" className="w-full border p-3" onChange={e => setFormData({...formData, name: e.target.value})} />
          <input type="tel" placeholder="Phone Number" className="w-full border p-3" onChange={e => setFormData({...formData, phone: e.target.value})} />
          <button onClick={() => setStep(2)} className="w-full bg-primary text-secondary py-4 font-bold uppercase mt-4">Continue to Delivery</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Delivery Address</h2>
          <textarea placeholder="Full Shipping Address" className="w-full border p-3 h-32" onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="w-1/2 border border-primary text-primary py-4 font-bold uppercase">Back</button>
            <button onClick={() => setStep(3)} className="w-1/2 bg-primary text-secondary py-4 font-bold uppercase">Continue to Payment</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Payment Options</h2>
          <div className="bg-neutralBg p-6 mb-6">
            <h3 className="font-bold mb-2">Order Summary</h3>
            <p>Total: ${total.toFixed(2)}</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <button className="w-full bg-primary text-secondary py-4 font-bold uppercase">Pay Securely via Card</button>
            <button 
              onClick={handleWhatsAppOrder}
              className="w-full bg-success text-white py-4 font-bold uppercase flex items-center justify-center gap-2"
            >
              Order via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
