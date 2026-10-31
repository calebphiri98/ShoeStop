import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';
import Footer from '../components/Footer';
import { whatsappLink } from '../config/contact';
import { CartIcon, ChatIcon, CloseIcon, ArrowRightIcon } from '../components/Icons';

const Shop = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedGender, setSelectedGender] = useState(location.state?.gender || 'All');
  const [loading, setLoading] = useState(true);

  const { cart, addToCart, clearCart } = useCart();
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
      minimumFractionDigits: 0
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
      <div id="products" className="container mx-auto px-3 sm:px-4 py-6 md:py-10 relative pb-36 flex-grow scroll-mt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div>
            <p className="text-accent text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] mb-1">
              Curated premium selection
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-primary">
              {selectedGender === 'All' ? 'All Styles' : selectedGender}
            </h2>
          </div>

          <div className="flex overflow-x-auto pb-1 -mx-3 px-3 gap-2 scrollbar-none md:flex-wrap md:overflow-visible md:pb-0 md:mx-0 md:px-0">
            {filterTabs.map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                className={`px-5 py-2 text-xs uppercase font-bold tracking-wider transition-all duration-200 border shrink-0 ${
                  selectedGender === gender
                    ? 'bg-primary border-primary text-accent'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-primary hover:text-primary'
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
          <div className="text-center py-16 px-4 border border-dashed border-gray-300 bg-white">
            <p className="text-gray-400 font-medium uppercase tracking-wider text-xs">
              No products available in "{selectedGender}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col bg-white border border-gray-100 hover:border-accent/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative overflow-hidden bg-neutralBg aspect-[4/5]">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {product.gender && (
                    <span className="absolute top-2 left-2 text-[9px] uppercase font-bold tracking-wider bg-primary text-accent px-2 py-1">
                      {product.gender}
                    </span>
                  )}
                </div>

                <div className="flex flex-col flex-grow p-3">
                  <h3 className="text-textDark font-semibold text-xs md:text-sm line-clamp-2 min-h-[2.25rem] leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-primary font-extrabold text-sm md:text-base mt-2 whitespace-nowrap">
                    {formatCurrency(product.price)}
                  </p>

                  <div className="mt-auto pt-3 flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="flex items-center justify-center gap-2 w-full bg-primary text-secondary py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-accent hover:text-primary active:bg-accent active:text-primary transition-colors duration-150"
                    >
                      <CartIcon className="w-4 h-4" />
                      Add To Cart
                    </button>
                    <a
                      href={whatsappLink(
                        `Hi ShoeStop & More! I'm interested in buying: ${product.name} (${formatCurrency(product.price)}). Is this available?`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center gap-2 w-full border border-success text-success py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-success hover:text-white active:bg-success active:text-white transition-colors duration-150"
                    >
                      <ChatIcon className="w-4 h-4" />
                      Ask On WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalItemsInCart > 0 && (
          <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-primary text-secondary px-4 py-3 shadow-2xl border border-accent/30 flex justify-between items-center gap-3 z-40 animate-fade-in">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (window.confirm('Clear all items from your shopping bag?')) {
                    clearCart();
                  }
                }}
                className="flex items-center gap-1 text-gray-400 hover:text-red-400 text-[10px] uppercase font-bold border border-gray-700 px-2 py-1.5 transition-colors"
                title="Clear bag"
              >
                <CloseIcon className="w-3 h-3" />
                Clear
              </button>

              <div>
                <p className="font-bold text-[11px] sm:text-xs tracking-wider uppercase">
                  Bag ({totalItemsInCart})
                </p>
                <p className="text-[9px] text-gray-400 tracking-wide uppercase mt-0.5">Secure your premium pair</p>
              </div>
            </div>

            <button
              onClick={handleProceedToCart}
              className="flex items-center gap-1.5 bg-accent text-primary px-4 py-2 text-xs font-extrabold uppercase tracking-wider hover:bg-white active:scale-95 transition-all duration-150"
            >
              Checkout
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Shop;