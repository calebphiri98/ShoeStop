import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Hero from './components/Hero';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Simple Nav Component for Demonstration
const Navbar = () => (
  <nav className="bg-primary text-secondary p-4 sticky top-0 z-50 flex justify-between items-center border-b border-accent/20">
    <Link to="/" className="text-xl font-bold tracking-widest text-accent uppercase">ShoeStop & More</Link>
    <div className="space-x-4 md:space-x-6 text-sm uppercase tracking-wider flex items-center">
      <Link to="/shop" className="hover:text-accent transition-colors hidden md:inline">Shop</Link>
      <Link to="/checkout" className="hover:text-accent transition-colors hidden md:inline">Cart/Checkout</Link>
      <Link to="/admin" className="text-gray-400 hover:text-secondary transition-colors hidden md:inline">Admin</Link>
      
      {/* Login / Profile Link */}
      <Link to="/login" className="hover:text-accent transition-colors md:ml-4 md:border-l md:pl-4 border-gray-600">
        Login / Sign Up
      </Link>
    </div>
  </nav>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-secondary text-textDark font-sans flex flex-col">
            <Navbar />
            <div className="flex-grow">
              <Routes>
                {/* Core Pages */}
                <Route path="/" element={<><Hero /><Shop /></>} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/checkout" element={<Checkout />} />
                
                {/* Dashboards */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dashboard" element={<CustomerDashboard />} />
                
                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
            </div>
            
            {/* Sticky Bottom Navigation for Mobile-First UX */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-primary border-t border-accent/20 flex justify-around py-3 text-xs uppercase tracking-wider text-secondary z-50">
              <Link to="/shop" className="flex flex-col items-center"><span>👟</span><span>Shop</span></Link>
              <Link to="/checkout" className="flex flex-col items-center"><span>🛒</span><span>Cart</span></Link>
              
              {/* Account Link maps directly to login (which handles the redirection to the dashboard) */}
              <Link to="/login" className="flex flex-col items-center"><span>👤</span><span>Account</span></Link>
              
              <a href="https://wa.me/995727978" className="flex flex-col items-center text-success"><span>💬</span><span>WhatsApp</span></a>
            </div>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;