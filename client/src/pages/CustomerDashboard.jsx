import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import API_URL from '../config/api';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editAddress, setEditAddress] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editItems, setEditItems] = useState([]);

  const formatCurrency = (priceValue) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0
    })
      .format(priceValue)
      .replace('MWK', 'MK');
  };

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
    <>
      <main className="cd-page">
        <div className="cd-container">
          <header className="cd-hero">
            <div>
              <h1 className="cd-hero-name">Hello, {user.name}</h1>
              <p className="cd-hero-email">{user.email}</p>
            </div>
            <button type="button" onClick={logout} className="cd-btn cd-btn--light">
              Log out
            </button>
          </header>

          <div className="cd-grid">
            <section className="cd-card" aria-labelledby="cd-orders-title">
              <h2 className="cd-card-title" id="cd-orders-title">Your orders</h2>
              <p className="cd-card-hint">Review, edit or cancel the orders you have placed.</p>

              {loading ? (
                <div className="cd-state">
                  <p>Loading your orders…</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="cd-state">
                  <h3 className="cd-state-title">No orders yet</h3>
                  <p>When you place an order it will show up here.</p>
                  <Link to="/" className="cd-btn cd-btn--primary">Browse products</Link>
                </div>
              ) : (
                <div className="cd-orders">
                  {orders.map((order) => {
                    const isCurrentEditRow = editingOrderId === order.id;
                    const statusKey = String(order.status || '').toLowerCase();
                    return (
                      <article key={order.id} className="cd-order">
                        <div className="cd-order-head">
                          <div>
                            <p className="cd-order-id">Order #{order.id}</p>
                            <p className="cd-order-date">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="cd-order-side">
                            <span className="cd-order-total">{formatCurrency(Number(order.total_amount))}</span>
                            <span className={`cd-status cd-status--${statusKey}`}>{order.status}</span>
                          </div>
                        </div>

                        <div className="cd-order-body">
                          <div>
                            <p className="cd-section-label">Items</p>
                            <ul className="cd-lines">
                              {isCurrentEditRow
                                ? editItems.map((item, idx) => (
                                    <li key={idx} className="cd-line">
                                      <div>
                                        <span className="cd-line-name">{item.product_name || `Item ID: ${item.product_id}`}</span>
                                        {item.size && <span className="cd-line-meta">Size {item.size}</span>}
                                      </div>
                                      <div className="cd-stepper">
                                        <button
                                          type="button"
                                          className="cd-qty-btn"
                                          aria-label="Decrease quantity"
                                          onClick={() => handleQuantityChange(item.item_id, -1)}
                                        >
                                          −
                                        </button>
                                        <span className="cd-qty-value">{item.quantity}</span>
                                        <button
                                          type="button"
                                          className="cd-qty-btn"
                                          aria-label="Increase quantity"
                                          onClick={() => handleQuantityChange(item.item_id, 1)}
                                        >
                                          +
                                        </button>
                                      </div>
                                    </li>
                                  ))
                                : order.items?.map((item, idx) => (
                                    <li key={idx} className="cd-line">
                                      <div>
                                        <span className="cd-line-name">{item.product_name}</span>
                                        {item.size && <span className="cd-line-meta">Size {item.size}</span>}
                                      </div>
                                      <span className="cd-line-qty">x{item.quantity}</span>
                                    </li>
                                  ))}
                            </ul>
                          </div>

                          {isCurrentEditRow ? (
                            <div className="cd-fields">
                              <div className="cd-field">
                                <label className="cd-label" htmlFor={`cd-address-${order.id}`}>Delivery address</label>
                                <input
                                  id={`cd-address-${order.id}`}
                                  type="text"
                                  value={editAddress}
                                  onChange={(e) => setEditAddress(e.target.value)}
                                  className="cd-input"
                                />
                              </div>
                              <div className="cd-field">
                                <label className="cd-label" htmlFor={`cd-whatsapp-${order.id}`}>WhatsApp number</label>
                                <input
                                  id={`cd-whatsapp-${order.id}`}
                                  type="tel"
                                  inputMode="tel"
                                  value={editWhatsapp}
                                  onChange={(e) => setEditWhatsapp(e.target.value)}
                                  className="cd-input"
                                />
                              </div>
                            </div>
                          ) : (
                            <dl className="cd-details">
                              <div>
                                <dt>Delivering to</dt>
                                <dd>{order.shipping_address}</dd>
                              </div>
                              <div>
                                <dt>WhatsApp number</dt>
                                <dd>{order.whatsapp_number || 'None'}</dd>
                              </div>
                            </dl>
                          )}

                          <div className="cd-actions">
                            {isCurrentEditRow ? (
                              <>
                                <button type="button" onClick={() => setEditingOrderId(null)} className="cd-btn cd-btn--ghost">Cancel</button>
                                <button type="button" onClick={() => handleUpdateOrder(order.id)} className="cd-btn cd-btn--primary">Save changes</button>
                              </>
                            ) : (
                              <>
                                <button type="button" onClick={() => startEditing(order)} className="cd-btn cd-btn--ghost">Edit order</button>
                                <button type="button" onClick={() => handleDeleteOrder(order.id)} className="cd-btn cd-btn--danger">Cancel order</button>
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <aside className="cd-side">
              <div className="cd-card">
                <h2 className="cd-card-title">Account</h2>
                <p className="cd-card-hint">Your membership details.</p>
                <dl className="cd-facts">
                  <div>
                    <dt>Account type</dt>
                    <dd>{user.role} member</dd>
                  </div>
                  <div>
                    <dt>Member since</dt>
                    <dd>June 2026</dd>
                  </div>
                </dl>
                <Link to="/" className="cd-btn cd-btn--primary cd-btn--block">Start a new order</Link>
              </div>

              <div className="cd-card cd-help">
                <h2 className="cd-card-title">Need help with an order?</h2>
                <p>Chat with us on WhatsApp about changes, delivery updates or sizing.</p>
                <a
                  href="https://wa.me/994950382"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cd-btn cd-btn--green cd-btn--block"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CustomerDashboard;