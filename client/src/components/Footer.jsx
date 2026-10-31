import React from 'react';
import { Link } from 'react-router-dom';
import { whatsappLink } from '../config/contact';
import { ChatIcon } from './Icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-secondary pt-14 pb-8 border-t border-accent/20 mt-16">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 pb-12 border-b border-gray-800">
        <div className="col-span-2 md:col-span-1 space-y-4">
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-widest text-secondary">
            ShoeStop<span className="text-accent">.</span>
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
            Premium footwear and fashion staples, carefully selected for style and comfort and delivered across Malawi.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-accent">Collections</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/shop" className="hover:text-accent transition-colors">Shop All</Link></li>
            <li><Link to="/shop" className="hover:text-accent transition-colors">Men</Link></li>
            <li><Link to="/shop" className="hover:text-accent transition-colors">Women</Link></li>
            <li><Link to="/shop" className="hover:text-accent transition-colors">Unisex</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-accent">Customer Desk</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/dashboard" className="hover:text-accent transition-colors">Order Tracking</Link></li>
            <li><Link to="/checkout" className="hover:text-accent transition-colors">Cart</Link></li>
            <li><Link to="/login" className="hover:text-accent transition-colors">My Account</Link></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1 space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-accent">Find Us</h4>
          <p className="text-sm text-gray-300">Lilongwe, Central Region, Malawi</p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-success text-success hover:bg-success hover:text-primary px-4 py-2.5 text-xs uppercase font-semibold tracking-wider transition-colors duration-200"
          >
            <ChatIcon className="w-4 h-4" />
            Chat On WhatsApp
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-[11px] text-gray-500 tracking-wider uppercase text-center">
        <p>&copy; {currentYear} ShoeStop & More. All rights reserved.</p>
        <div className="flex gap-4 items-center">
          <span>Prices in MK (MWK)</span>
          <span className="text-gray-700">|</span>
          <span>Secure Checkout</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;