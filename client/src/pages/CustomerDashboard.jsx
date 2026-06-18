
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Added Link for routing navigation
import Footer from '../components/Footer';
import API_URL from '../config/api';

const CustomerDashboard = () => {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Editing States
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editAddress, setEditAddress] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editItems, setEditItems] = useState([]); 

  // Safely parses responses, checking content types beforehand
  const handleFetchResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
      }
      return data;
    } else {
      const rawText = await response.text();
      console.error("Received non-JSON fallback response from backend:", rawText);
      throw new Error(`Server returned HTML error markup instead of JSON (Status code: ${response.status}). Please check your server routing or local backend logs.`);
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await handleFetchResponse(response);
      const myOrders = Array.isArray(data) ? data.filter(order => order.user_id === user.id) : [];
      setOrders(myOrders);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate, fetchOrders]);

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel and delete this order completely?")) return;
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      await handleFetchResponse(response);
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (err) {
      alert(err.message);
    }
  };

  // Open Edit Mode & Clone State values
  const startEditing = (order) => {
    setEditingOrderId(order.id);
    setEditAddress(order.shipping_address || '');
    setEditWhatsapp(order.whatsapp_number || '');
    setEditItems(order.items ? [...order.items] : []); 
  };

  const handleQuantityChange = (itemId, change) => {
    setEditItems(prev => prev.map(item => {
      if (item.item_id === itemId) {
        const calculatedQty = item.quantity + change;
        return { ...item, quantity: calculatedQty < 0 ? 0 : calculatedQty };
      }
      return item;
    }));
  };

  const handleUpdateOrder = async (orderId) => {
    try {
      console.log("Updating Order payload:", {
        orderId,
        shippingAddress: editAddress,
        whatsappNumber: editWhatsapp,
        items: editItems
      });

      const response = await fetch(
        `${API_URL}/api/orders/${orderId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            shippingAddress: editAddress,
            whatsappNumber: editWhatsapp,
            items: editItems
          })
        }
      );

      const data = await handleFetchResponse(response);
      console.log("Server Update Sync Complete:", data);
      
      alert(data.message || "Order updated successfully!");
      setEditingOrderId(null);
      fetchOrders();
    } catch (err) {
      console.error("Caught Update Error Exception:", err);
      alert(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Premium Profile Heading */}
      <div className="bg-primary text-secondary p-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-bold">Customer Portal</span>
          <h2 className="text-3xl font-bold uppercase mt-1">Hello, {user.name}</h2>
          <p className="text-gray-300 text-sm mt-1">{user.email}</p>
        </div>
        <button 
          onClick={logout} 
          className="border border-secondary/40 hover:border-accent text-secondary px-5 py-2 text-sm uppercase font-semibold tracking-wider transition-colors"
        >
          Logout Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Order Management Layout Cards */}
        <div className="lg:col-span-2 bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold uppercase tracking-wide text-primary mb-6">Your Order Management</h3>
          
          {loading ? (
            <p className="text-gray-500">Retrieving transactional histories...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">📦</span>
              <p className="text-gray-500 mt-4 font-medium mb-6">No order placements found under this name.</p>
              {/* ADDED BROWSE BUTTON FOR EMPTY STATE */}
              <Link 
                to="/" 
                className="inline-block bg-primary text-secondary px-6 py-3 font-bold uppercase text-xs tracking-wider hover:bg-black transition-colors"
              >
                👟 Browse Products & Place Order
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const isCurrentEditRow = editingOrderId === order.id;
                return (
                  <div key={order.id} className="border border-gray-200 p-6 flex flex-col gap-4">
                    
                    {/* Invoice Header */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <div>
                        <p className="font-bold text-base text-primary">Order #{order.id}</p>
                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-primary block">${Number(order.total_amount).toFixed(2)}</span>
                        <span className="inline-block bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold mt-1">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Order Line-Items Loop */}
                    <div className="bg-neutralBg p-4 space-y-3">
                      <p className="text-xs mercantile-accent font-bold uppercase tracking-wider text-gray-400">Items Ordered:</p>
                      
                      {isCurrentEditRow ? (
                        // EDIT STATE PRODUCTS: Interactive Quantity Adjuster
                        editItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-200/50 pb-2 last:border-0">
                            <div>
                              <span className="font-semibold text-primary">{item.product_name || `Item ID: ${item.product_id}`}</span>
                              {item.size && <span className="text-xs text-gray-400 ml-2">({item.size})</span>}
                            </div>
                            <div className="flex items-center gap-2 bg-white border border-gray-300 px-2 py-1">
                              <button type="button" onClick={() => handleQuantityChange(item.item_id, -1)} className="text-primary font-bold px-1 hover:text-accent">-</button>
                              <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                              <button type="button" onClick={() => handleQuantityChange(item.item_id, 1)} className="text-primary font-bold px-1 hover:text-accent">+</button>
                            </div>
                          </div>
                        ))
                      ) : (
                        // NORMAL DISPLAY STATE PRODUCTS
                        order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-textDark border-b border-gray-200/50 pb-2 last:border-0">
                            <div>
                              <span className="font-semibold text-primary">{item.product_name}</span>
                              {item.size && <span className="text-xs text-gray-500 ml-2">Size: {item.size}</span>}
                            </div>
                            <span className="font-medium text-gray-600">x{item.quantity}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Context Form Parameters */}
                    <div className="space-y-3 text-sm pt-2">
                      {isCurrentEditRow ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Edit Delivery Address</label>
                            <input type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="w-full border border-gray-300 p-2 text-sm focus:border-primary focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Edit Contact Link</label>
                            <input type="text" value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} className="w-full border border-gray-300 p-2 text-sm focus:border-primary focus:outline-none" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-600"><span className="font-bold text-xs uppercase tracking-wider block text-gray-400">Deliver To:</span> {order.shipping_address}</p>
                          <p className="text-gray-600"><span className="font-bold text-xs uppercase tracking-wider block text-gray-400">WhatsApp Notification:</span> {order.whatsapp_number || 'None'}</p>
                        </>
                      )}
                    </div>

                    {/* Action Execution Dashboard Handles */}
                    <div className="flex gap-3 justify-end border-t border-gray-100 pt-4 mt-2">
                      {isCurrentEditRow ? (
                        <>
                          <button onClick={() => setEditingOrderId(null)} className="px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-gray-300">Cancel</button>
                          <button onClick={() => handleUpdateOrder(order.id)} className="px-4 py-2 text-xs uppercase tracking-wider font-semibold bg-primary text-secondary hover:bg-black">Save Changes</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(order)} className="px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-primary text-primary hover:bg-primary hover:text-secondary transition-colors">✏️ Edit Details / Qty</button>
                          <button onClick={() => handleDeleteOrder(order.id)} className="px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors">🗑️ Cancel Order</button>
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: Member Info & Interactive Action Shortcuts */}
        <div className="space-y-6">
          <div className="bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold uppercase tracking-wide text-primary mb-4">Account Information</h3>
            <div className="text-sm space-y-4">
              <div>
                <span className="block text-xs uppercase tracking-wider text-gray-400">Account Type</span>
                <span className="font-medium capitalize text-primary">{user.role} Member</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-gray-400">Member Since</span>
                <span className="font-medium text-primary">June 2026</span>
              </div>
              
              {/* ADDED PERMANENT QUICK BROWSE ACTION BUTTON */}
              <div className="pt-2 border-t border-gray-100">
                <Link 
                  to="/" 
                  className="w-full text-center block bg-primary text-secondary py-3 font-bold uppercase text-xs tracking-wider hover:bg-accent hover:text-primary transition-colors"
                >
                  🛍️ New Order / Browse Shop
                </Link>
              </div>
            </div>
          </div>

          {/* Active Live Help Widget */}
          <div className="bg-neutralBg p-6 border border-gray-200 text-center">
            <h4 className="font-bold text-primary uppercase text-sm tracking-wide mb-1">Need Order Assistance?</h4>
            <p className="text-xs text-gray-500 mb-4">Chat with our specialized concierge team on WhatsApp regarding modifications, tracking metrics, or customized sizing adjustments.</p>
            <a 
              href="https://wa.me/995727978" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full bg-success text-white py-3 font-bold uppercase tracking-wider text-xs shadow-sm hover:opacity-90 transition-opacity"
            >
              💬 WhatsApp Support
            </a>
          </div>
        </div>

      </div>
      <Footer/>
    </div>
  );
};

export default CustomerDashboard;
