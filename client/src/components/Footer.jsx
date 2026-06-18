import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-secondary pt-16 pb-8 border-t border-accent/20 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
        
        {/* Column 1: Brand Identifier */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-secondary">
            ShoeStop<span className="text-accent">.</span>
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
            Providing premium footwear collections and exclusive fashion staples carefully curated for high-end styling layouts across Malawi.
          </p>
        </div>

        {/* Column 2: Structural Navigation Gateway */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-accent">Collections</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/shop" className="hover:text-accent transition-colors">Shop All</Link></li>
            <li><span className="cursor-pointer hover:text-accent transition-colors">Men's Edition</span></li>
            <li><span className="cursor-pointer hover:text-accent transition-colors">Women's Premium</span></li>
            <li><span className="cursor-pointer hover:text-accent transition-colors">Unisex Essentials</span></li>
          </ul>
        </div>

        {/* Column 3: Customer Portal Support Layouts */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-accent">Customer Desk</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/dashboard" className="hover:text-accent transition-colors">Order Tracking</Link></li>
            <li><span className="cursor-pointer hover:text-accent transition-colors">Shipping Policies</span></li>
            <li><span className="cursor-pointer hover:text-accent transition-colors">Size Assistance</span></li>
            <li><span className="cursor-pointer hover:text-accent transition-colors">Terms of Service</span></li>
          </ul>
        </div>

        {/* Column 4: Contact & Verification */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest font-bold text-accent">Headquarters</h4>
          <p className="text-sm text-gray-300">Lilongwe, Central Region, Malawi</p>
          <div className="pt-2">
            <a 
              href="https://wa.me/995727978" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block border border-secondary/30 hover:border-accent text-secondary hover:text-accent px-4 py-2 text-xs uppercase font-semibold tracking-wider transition-all duration-200"
            >
              💬 WhatsApp Concierge
            </a>
          </div>
        </div>

      </div>

      {/* Footer Bottom copyright and transaction flags */}
      <div className="container mx-auto px-4 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-gray-500 tracking-wider uppercase">
        <p>© {currentYear} ShoeStop Premium. All Rights Reserved.</p>
        <div className="flex gap-4 items-center">
          <span>Local Currency: MK (MWK)</span>
          <span className="text-gray-700">|</span>
          <span>Secure Checkout Secured</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;