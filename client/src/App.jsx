import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import Hero from './components/Hero';

// Simple Nav Component for Demonstration
const Navbar = () => (
  <nav className="bg-primary text-secondary p-4 sticky top-0 z-50 flex justify-between items-center border-b border-accent/20">
    <Link to="/" className="text-xl font-bold tracking-widest text-accent uppercase">ShoeStop & More</Link>
    <div className="space-x-6 text-sm uppercase tracking-wider">
      <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
      <Link to="/checkout" className="hover:text-accent transition-colors">Cart/Checkout</Link>
      <Link to="/admin" className="text-gray-400 hover:text-secondary transition-colors">Admin</Link>
    </div>
  </nav>
);

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-secondary text-textDark font-sans flex flex-col">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<><Hero /><Shop /></>} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
          
          {/* Sticky Bottom Navigation for Mobile-First UX */}
          <div className="md:hidden fixed bottom-0 inset-x-0 bg-primary border-t border-accent/20 flex justify-around py-3 text-xs uppercase tracking-wider text-secondary z-50">
            <Link to="/shop" className="flex flex-col items-center"><span>👟</span><span>Shop</span></Link>
            <Link to="/checkout" className="flex flex-col items-center"><span>🛒</span><span>Cart</span></Link>
            <a href="https://wa.me/1234567890" className="flex flex-col items-center text-success"><span>💬</span><span>WhatsApp</span></a>
          </div>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;