import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Hero from './components/Hero';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { whatsappLink } from './config/contact';
import { CartIcon, UserIcon, ChatIcon, MenuIcon, CloseIcon, ChevronRightIcon } from './components/Icons';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const useCartCount = () => {
  const { cart } = useCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

const Navbar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const count = useCartCount();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const linkClass = (path) =>
    `text-xs uppercase tracking-[0.2em] font-semibold transition-colors ${
      pathname === path ? 'text-accent' : 'text-secondary/80 hover:text-accent'
    }`;

  const menuLinkClass = (path) =>
    `flex items-center justify-between py-4 border-b border-white/10 text-sm uppercase tracking-[0.2em] font-semibold ${
      pathname === path ? 'text-accent' : 'text-secondary'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-primary border-b border-accent/20">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="font-display font-extrabold text-base sm:text-xl tracking-[0.16em] text-accent uppercase whitespace-nowrap"
        >
          ShoeStop <span className="text-secondary">&amp; More</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={linkClass('/')}>Home</Link>
          <Link to="/shop" className={linkClass('/shop')}>Shop</Link>
          <Link to="/checkout" className={linkClass('/checkout')}>Cart / Checkout</Link>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[0.2em] font-semibold text-secondary/80 hover:text-accent transition-colors"
          >
            Contact
          </a>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link to="/checkout" aria-label="Cart" className="relative p-2 text-secondary hover:text-accent transition-colors">
            <CartIcon className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-accent text-primary text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <Link
            to="/login"
            className="hidden md:inline-flex border border-accent text-accent hover:bg-accent hover:text-primary px-4 py-2 text-xs uppercase font-semibold tracking-wider transition-colors"
          >
            {user ? 'My Account' : 'Login / Sign Up'}
          </Link>
          <button
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="md:hidden p-2 text-secondary hover:text-accent transition-colors"
          >
            {open ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden bg-primary border-t border-accent/20 animate-fade-in">
          <div className="container mx-auto px-4 pb-4 flex flex-col">
            <Link to="/" className={menuLinkClass('/')}>
              Home
              <ChevronRightIcon className="w-4 h-4 text-accent" />
            </Link>
            <Link to="/shop" className={menuLinkClass('/shop')}>
              Shop
              <ChevronRightIcon className="w-4 h-4 text-accent" />
            </Link>
            <Link to="/checkout" className={menuLinkClass('/checkout')}>
              <span className="flex items-center gap-2">
                Cart / Checkout
                {count > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-accent text-primary text-[10px] font-bold flex items-center justify-center">
                    {count}
                  </span>
                )}
              </span>
              <ChevronRightIcon className="w-4 h-4 text-accent" />
            </Link>
            <Link to="/login" className={menuLinkClass('/login')}>
              <span className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                {user ? 'My Account' : 'Login / Sign Up'}
              </span>
              <ChevronRightIcon className="w-4 h-4 text-accent" />
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 bg-success text-primary py-3.5 text-xs uppercase tracking-[0.2em] font-bold"
            >
              <ChatIcon className="w-4 h-4" />
              Chat On WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

const AppShell = () => {
  const location = useLocation();
  const isBackoffice = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-secondary text-textDark font-sans flex flex-col">
      {!isBackoffice && <Navbar />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<><Hero /><Shop /></>} />
          <Route path="/shop" element={<Shop />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppShell />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;