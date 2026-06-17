import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API_URL from '../config/api';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  // Calculate total items currently in the cart
  const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8 relative pb-24">
      <h1 className="text-3xl font-bold mb-8 uppercase tracking-wider text-primary">Shop All</h1>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading premium styles...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer flex flex-col justify-between">
              <div>
                <div className="relative overflow-hidden bg-neutralBg mb-4 aspect-[4/5]">
                  {/* DB ONLY IMAGE (no fallback) */}
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Interactive Quick Add Button Overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents clicking the card container triggering other events
                      addToCart(product);
                    }}
                    className="absolute inset-x-0 bottom-0 bg-primary/95 text-secondary translate-y-full group-hover:translate-y-0 transition-transform duration-300 py-3 text-center uppercase text-sm font-semibold tracking-wider hover:bg-black"
                  >
                    ⚡ Quick Add
                  </button>
                </div>

                <h3 className="text-textDark font-medium mb-1 line-clamp-2">
                  {product.name}
                </h3>
              </div>

              <p className="text-primary font-bold mt-1">
                ${Number(product.price).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Persistent Floating Banner: Appears when items exist in cart */}
      {totalItemsInCart > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-xl bg-primary text-secondary px-6 py-4 shadow-xl border border-accent/30 flex justify-between items-center z-40 animate-fade-in rounded-none">
          <div>
            <p className="font-semibold text-sm tracking-wide uppercase">
              Bag Updated ({totalItemsInCart} {totalItemsInCart === 1 ? 'item' : 'items'})
            </p>
            <p className="text-xs text-gray-400">Ready to secure your luxury pieces?</p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="bg-accent text-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-primary transition-all duration-300 shadow-md"
          >
            Proceed to Cart →
          </button>
        </div>
      )}
    </div>
  );
};

export default Shop;

