import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop All</h1>

      {loading ? (
        <p>Loading premium styles...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">

              <div className="relative overflow-hidden bg-neutralBg mb-4 aspect-[4/5]">

                {/* DB ONLY IMAGE (no fallback) */}
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-x-0 bottom-0 bg-primary/90 text-secondary translate-y-full group-hover:translate-y-0 transition-transform duration-300 py-3 text-center uppercase text-sm font-semibold tracking-wider">
                  Quick Add
                </div>
              </div>

              <h3 className="text-textDark font-medium mb-1">
                {product.name}
              </h3>

              <p className="text-primary font-bold">
                ${product.price}
              </p>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;