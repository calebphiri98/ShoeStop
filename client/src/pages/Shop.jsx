import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API_URL from '../config/api';
import Footer from '../components/Footer'; 

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedGender, setSelectedGender] = useState('All');
  const [loading, setLoading] = useState(true);
  const { cart, addToCart } = useCart();
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
      minimumFractionDigits: 2
    })
    .format(priceValue)
    .replace('MWK', 'MK'); 
  };

  const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);
  const filterTabs = ['All', 'Men', 'Women', 'Unisex'];

  return (
    <div className="flex flex-col min-h-screen justify-between">
      <div className="container mx-auto px-4 py-8 relative pb-32 flex-grow">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider text-primary">
              Shop {selectedGender === 'All' ? 'All Styles' : selectedGender}
            </h1>
            <p className="text-gray-400 text-xs mt-1">Curated collection matching your selective criteria</p>
          </div>

          {/* Dynamic Category Filter Toggle Handles */}
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                className={`px-5 py-2 text-xs uppercase font-bold tracking-wider transition-all duration-200 border ${
                  selectedGender === gender
                    ? 'bg-primary border-primary text-secondary'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-primary hover:text-primary'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading premium styles...</p>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 bg-neutralBg">
            <span className="text-3xl">👟</span>
            <p className="text-gray-500 mt-4 font-medium uppercase tracking-wider text-sm">
              No products found matching "{selectedGender}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="relative overflow-hidden bg-neutralBg mb-4 aspect-[4/5]">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* FIXED: Quick add now stays persistent on mobile devices, and uses modern opacity slides on desktop layouts */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="absolute inset-x-0 bottom-0 bg-primary/95 text-secondary py-3 text-center uppercase text-xs md:text-sm font-semibold tracking-wider hover:bg-black transition-all duration-300 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0"
                    >
                      ⚡ Quick Add
                    </button>
                  </div>

                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="text-textDark font-medium line-clamp-2 text-sm md:text-base">
                      {product.name}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-sm shrink-0">
                      {product.gender}
                    </span>
                  </div>
                </div>

                <p className="text-primary font-bold mt-1 text-sm md:text-base">
                  {formatCurrency(product.price)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Persistent Floating Banner */}
        {totalItemsInCart > 0 && (
          /* FIXED: Shifted bottom layout anchor to bottom-24 on mobile to safely sit above any sticky bottom navigation */
          <div className="fixed bottom-24 md:bottom-6 left-1/2 transform -translate-x-1/2 w-[92%] max-w-xl bg-primary text-secondary px-4 md:px-6 py-4 shadow-2xl border border-accent/30 flex justify-between items-center z-50 animate-fade-in rounded-none">
            <div>
              <p className="font-semibold text-xs md:text-sm tracking-wide uppercase">
                Bag Updated ({totalItemsInCart} {totalItemsInCart === 1 ? 'item' : 'items'})
              </p>
              <p className="text-[11px] text-gray-400 hidden sm:block">Ready to secure your luxury pieces?</p>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="bg-accent text-primary px-4 md:px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-primary transition-all duration-300 shadow-md whitespace-nowrap"
            >
              Proceed to Cart →
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Shop;


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useCart } from '../context/CartContext';
// import API_URL from '../config/api';
// import Footer from '../components/Footer'; // IMPORTED: Added reusable footer file layout

// const Shop = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [selectedGender, setSelectedGender] = useState('All');
//   const [loading, setLoading] = useState(true);
//   const { cart, addToCart } = useCart();
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetch(`${API_URL}/api/products`)
//       .then((res) => res.json())
//       .then((data) => {
//         setProducts(data);
//         setFilteredProducts(data); 
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error('Error fetching products:', err);
//         setLoading(false);
//       });
//   }, []);

//   useEffect(() => {
//     if (selectedGender === 'All') {
//       setFilteredProducts(products);
//     } else {
//       setFilteredProducts(
//         products.filter(
//           (product) => product.gender?.toLowerCase() === selectedGender.toLowerCase()
//         )
//       );
//     }
//   }, [selectedGender, products]);

//   const formatCurrency = (priceValue) => {
//     return new Intl.NumberFormat('en-MW', {
//       style: 'currency',
//       currency: 'MWK',
//       minimumFractionDigits: 2
//     })
//     .format(priceValue)
//     .replace('MWK', 'MK'); 
//   };

//   const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);
//   const filterTabs = ['All', 'Men', 'Women', 'Unisex'];

//   return (
//     /* Flex wrappers ensure that the footer safely pins to layouts when screens scale */
//     <div className="flex flex-col min-h-screen justify-between">
//       <div className="container mx-auto px-4 py-8 relative pb-24 flex-grow">
//         {/* Title Header */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
//           <div>
//             <h1 className="text-3xl font-bold uppercase tracking-wider text-primary">
//               Shop {selectedGender === 'All' ? 'All Styles' : selectedGender}
//             </h1>
//             <p className="text-gray-400 text-xs mt-1">Curated collection matching your selective criteria</p>
//           </div>

//           {/* Dynamic Category Filter Toggle Handles */}
//           <div className="flex flex-wrap gap-2">
//             {filterTabs.map((gender) => (
//               <button
//                 key={gender}
//                 onClick={() => setSelectedGender(gender)}
//                 className={`px-5 py-2 text-xs uppercase font-bold tracking-wider transition-all duration-200 border ${
//                   selectedGender === gender
//                     ? 'bg-primary border-primary text-secondary'
//                     : 'bg-white border-gray-200 text-gray-500 hover:border-primary hover:text-primary'
//                 }`}
//               >
//                 {gender}
//               </button>
//             ))}
//           </div>
//         </div>

//         {loading ? (
//           <p className="text-gray-500 animate-pulse">Loading premium styles...</p>
//         ) : filteredProducts.length === 0 ? (
//           <div className="text-center py-20 border border-dashed border-gray-200 bg-neutralBg">
//             <span className="text-3xl">👟</span>
//             <p className="text-gray-500 mt-4 font-medium uppercase tracking-wider text-sm">
//               No products found matching "{selectedGender}".
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {filteredProducts.map((product) => (
//               <div key={product.id} className="group cursor-pointer flex flex-col justify-between">
//                 <div>
//                   <div className="relative overflow-hidden bg-neutralBg mb-4 aspect-[4/5]">
//                     <img
//                       src={product.images?.[0]}
//                       alt={product.name}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                     />

//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         addToCart(product);
//                       }}
//                       className="absolute inset-x-0 bottom-0 bg-primary/95 text-secondary translate-y-full group-hover:translate-y-0 transition-transform duration-300 py-3 text-center uppercase text-sm font-semibold tracking-wider hover:bg-black"
//                     >
//                       ⚡ Quick Add
//                     </button>
//                   </div>

//                   <div className="flex justify-between items-start gap-2 mb-1">
//                     <h3 className="text-textDark font-medium line-clamp-2 text-sm md:text-base">
//                       {product.name}
//                     </h3>
//                     <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-sm shrink-0">
//                       {product.gender}
//                     </span>
//                   </div>
//                 </div>

//                 <p className="text-primary font-bold mt-1 text-sm md:text-base">
//                   {formatCurrency(product.price)}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Persistent Floating Banner */}
//         {totalItemsInCart > 0 && (
//           <div className="fixed bottom-16 md:bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-xl bg-primary text-secondary px-6 py-4 shadow-xl border border-accent/30 flex justify-between items-center z-40 animate-fade-in rounded-none">
//             <div>
//               <p className="font-semibold text-sm tracking-wide uppercase">
//                 Bag Updated ({totalItemsInCart} {totalItemsInCart === 1 ? 'item' : 'items'})
//               </p>
//               <p className="text-xs text-gray-400">Ready to secure your luxury pieces?</p>
//             </div>
//             <button
//               onClick={() => navigate('/checkout')}
//               className="bg-accent text-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-primary transition-all duration-300 shadow-md"
//             >
//               Proceed to Cart →
//             </button>
//           </div>
//         )}
//       </div>

//       {/* RENDER HOOK: Added the common shared footer layout boundary block */}
//       <Footer />
//     </div>
//   );
// };

// export default Shop;
