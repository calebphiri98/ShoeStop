import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; 
import API_URL from '../config/api';
import Footer from '../components/Footer'; 

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedGender, setSelectedGender] = useState('All');
  const [loading, setLoading] = useState(true);
  const { cart, addToCart } = useCart();
  const { user } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data); 
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedGender === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter(
          (product) => product.gender?.toLowerCase() === selectedGender.toLowerCase()
        )
      );
    }
  }, [selectedGender, products]);

  const formatCurrency = (priceValue) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0 // Cleaner presentation for mobile UI (removes unnecessary .00)
    })
    .format(priceValue)
    .replace('MWK', 'MK'); 
  };

  const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);
  const filterTabs = ['All', 'Men', 'Women', 'Unisex'];

  const handleProceedToCart = () => {
    if (user && user.token) {
      navigate('/checkout'); 
    } else {
      navigate('/login'); 
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-between bg-neutralBg/30">
      {/* Optimized mobile layout wrapper containers */}
      <div className="container mx-auto px-3 sm:px-4 py-4 md:py-8 relative pb-36 flex-grow">
        
        {/* Header Section - Clean & Stacked elegantly on mobile */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-primary">
              {selectedGender === 'All' ? 'All Styles' : selectedGender}
            </h1>
            <p className="text-gray-400 text-[10px] md:text-xs mt-0.5">Curated premium selection</p>
          </div>

          {/* MOBILE UPGRADE: Swipeable horizontally-scrolling filter track bar */}
          <div className="flex overflow-x-auto pb-1 -mx-3 px-3 gap-2 scrollbar-none md:flex-wrap md:overflow-visible md:pb-0 md:mx-0 md:px-0">
            {filterTabs.map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                className={`px-5 py-2 text-xs uppercase font-bold tracking-wider transition-all duration-200 border shrink-0 snap-center ${
                  selectedGender === gender
                    ? 'bg-primary border-primary text-secondary'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500 font-medium tracking-wide animate-pulse text-sm">Loading premium styles...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-gray-200 bg-white shadow-sm">
            <span className="text-4xl block mb-2">👟</span>
            <p className="text-gray-400 font-medium uppercase tracking-wider text-xs">
              No products available in "{selectedGender}".
            </p>
          </div>
        ) : (
          /* MOBILE UPGRADE: Tight grid spacing optimized for smaller viewports */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group flex flex-col justify-between bg-white p-2 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div>
                  {/* Aspect ratio bounding box for mobile fluidity */}
                  <div className="relative overflow-hidden bg-neutralBg mb-2 aspect-[4/5]">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute top-1 right-1 text-[9px] uppercase font-bold text-gray-500 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 shadow-xs">
                      {product.gender}
                    </span>
                  </div>

                  <h3 className="text-textDark font-medium line-clamp-2 text-xs md:text-sm min-h-[2rem] px-0.5 leading-tight">
                    {product.name}
                  </h3>
                </div>

                <div>
                  {/* Dynamic Mobile Layout Stack for Row Pricing Matrix */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 pt-1 border-t border-gray-50/50 gap-1.5">
                    <p className="text-primary font-black text-sm md:text-base whitespace-nowrap">
                      {formatCurrency(product.price)}
                    </p>
                    
                    {/* Native App-like Sticky WhatsApp Short Link Hook */}
                    <a
                      href={`https://wa.me/265994950382?text=${encodeURIComponent(
                        `Hi ShoeStop & More! I'm interested in buying: ${product.name} (${formatCurrency(product.price)}). Is this available?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()} 
                      className="bg-[#25D366] text-white w-full sm:w-auto text-center justify-center px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xs flex items-center gap-1 active:bg-[#1ebd54]"
                    >
                      <span className="text-xs">💬</span> WhatsApp
                    </a>
                  </div>

                  {/* Ergonomic Big Primary Button for Thumb Interaction Loops */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="w-full mt-2.5 bg-primary text-secondary py-2.5 text-center uppercase text-[11px] md:text-xs font-bold tracking-widest active:bg-accent active:text-primary transition-colors duration-150"
                  >
                    🛒 Add To Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Mobile Sticky Action Hub Drawer Banner */}
        {totalItemsInCart > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[92%] max-w-md bg-primary text-secondary px-4 py-3.5 shadow-2xl border border-accent/20 flex justify-between items-center z-50 animate-fade-in rounded-none backdrop-blur-xs">
            <div>
              <p className="font-bold text-xs tracking-wider uppercase">
                Bag Updated ({totalItemsInCart})
              </p>
              <p className="text-[9px] text-gray-400 tracking-wide uppercase mt-0.5">Secure your premium pair</p>
            </div>
            <button
              onClick={handleProceedToCart}
              className="bg-accent text-primary px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-white active:scale-95 transition-all duration-150 shadow-md"
            >
              Checkout →
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
