import React from 'react';
import API_URL from '../config/api';

const Hero = () => {
  return (
    <div className="relative bg-primary w-full h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40" 
        style={{ backgroundImage: "url('/assets/hero-fashion-banner.jpg')" }}
      ></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1 className="text-secondary text-5xl md:text-7xl font-bold uppercase tracking-tight mb-4">
          Step Into Style.<br/> Dress With Confidence.
        </h1>
        <p className="text-neutralBg text-lg md:text-xl font-light mb-8 max-w-2xl mx-auto">
          Premium Shoes, Fashion Bags & Trendy Apparel For Men And Women.
        </p>
        
        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-8 py-4 bg-accent text-primary font-bold uppercase tracking-wider hover:bg-hoverAccent transition-colors duration-300">
            Shop Now
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-secondary text-secondary font-bold uppercase tracking-wider hover:bg-secondary hover:text-primary transition-colors duration-300">
            View New Arrivals
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
