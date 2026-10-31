import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config/api';
import './Checkout.css';

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
  const itemCount = cart.reduce((t, i) => t + i.quantity, 0);

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
      window.open(`https://wa.me/265994950382?text=${waMessage}`, '_blank');

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

  const renderItems = () => (
    <ul className="co-items">
      {cart.map((item) => {
        const img = item.image || item.imageUrl || item.image_url;
        return (
          <li key={item.id} className="co-item">
            <div className="co-thumb" aria-hidden="true">
              {img ? <img src={img} alt="" loading="lazy" /> : (item.name || '').charAt(0)}
              <span className="co-thumb-qty">{item.quantity}</span>
            </div>
            <div className="co-item-info">
              <span className="co-item-name">{item.name}</span>
              <span className="co-item-meta">Qty {item.quantity}</span>
            </div>
            <span className="co-item-price">{formatCurrency(item.price * item.quantity)}</span>
          </li>
        );
      })}
    </ul>
  );

  const renderTotals = () => (
    <div className="co-totals">
      <div className="co-totals-row">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="co-totals-row">
        <span>Delivery</span>
        <span>{formatCurrency(shippingFee)}</span>
      </div>
      <div className="co-totals-row co-totals-row--grand">
        <span>Total</span>
        <span>{formatCurrency(orderTotal)}</span>
      </div>
    </div>
  );

  return (
    <main className="co-page">
      <div className="co-container">
        <header className="co-header">
          <h1 className="co-title">Checkout</h1>
          <p className="co-subtitle">Tell us where to deliver. We confirm your order on WhatsApp.</p>
          <ol className="co-steps" aria-label="Checkout progress">
            <li className="co-step co-step--done">
              <span className="co-step-dot">1</span>
              <span>Bag</span>
            </li>
            <li className="co-step co-step--current" aria-current="step">
              <span className="co-step-dot">2</span>
              <span>Delivery</span>
            </li>
            <li className="co-step">
              <span className="co-step-dot">3</span>
              <span>Confirm</span>
            </li>
          </ol>
        </header>

        <div className="co-grid">
          <section className="co-mobile-summary" aria-label="Order summary">
            <button
              type="button"
              className="co-mobile-toggle"
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              aria-expanded={showMobileSummary}
            >
              <span className="co-mobile-toggle-label">
                Order summary
                <span className="co-badge">{itemCount}</span>
              </span>
              <span className="co-mobile-toggle-total">
                {formatCurrency(orderTotal)}
                <span className={`co-chevron ${showMobileSummary ? 'co-chevron--open' : ''}`} aria-hidden="true" />
              </span>
            </button>

            {showMobileSummary && (
              <div className="co-mobile-body">
                {cart.length === 0 ? (
                  <p className="co-help" style={{ paddingTop: 12 }}>Your bag is empty.</p>
                ) : (
                  <>
                    {renderItems()}
                    {renderTotals()}
                  </>
                )}
              </div>
            )}
          </section>

          <section className="co-card" aria-labelledby="co-delivery-title">
            <h2 className="co-card-title" id="co-delivery-title">Delivery details</h2>
            <p className="co-card-hint">We use these to deliver your order and send confirmation.</p>

            {!user && (
              <div className="co-alert co-alert--notice">
                You are checking out as a guest.{' '}
                <Link to="/login">Log in</Link> to keep a history of your orders.
              </div>
            )}

            {errorMessage && (
              <div className="co-alert co-alert--error" role="alert">{errorMessage}</div>
            )}

            <form onSubmit={handlePlaceOrder} className="co-form">
              <div className="co-field">
                <label className="co-label" htmlFor="co-address">Delivery address</label>
                <textarea
                  id="co-address"
                  required
                  rows="3"
                  autoComplete="street-address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="co-textarea"
                  placeholder="Area or street, house number, city"
                />
              </div>

              <div className="co-field">
                <label className="co-label" htmlFor="co-whatsapp">WhatsApp number</label>
                <input
                  id="co-whatsapp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="co-input"
                  placeholder="+265 99 123 4567"
                />
                <p className="co-help">We send your order confirmation to this number.</p>
              </div>

              <button
                type="submit"
                className="co-button"
                disabled={loading || cart.length === 0}
              >
                {loading && <span className="co-spinner" aria-hidden="true" />}
                {loading ? 'Placing your order…' : `Place order · ${formatCurrency(orderTotal)}`}
              </button>

              <ul className="co-assurance">
                <li>Confirmation on WhatsApp</li>
                <li>Pay on delivery arrangement via chat</li>
              </ul>
            </form>
          </section>

          <aside className="co-card co-sidebar" aria-label="Order summary">
            <h2 className="co-card-title">Order summary</h2>
            <p className="co-card-hint">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag</p>

            {cart.length === 0 ? (
              <div className="co-empty">
                <p>Your bag is empty.</p>
                <Link to="/shop" className="co-link">Browse the shop</Link>
              </div>
            ) : (
              <>
                {renderItems()}
                {renderTotals()}
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;