import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config/api';
import { TruckIcon, ChatIcon, ShieldIcon, ArrowRightIcon } from './Icons';

const trustItems = [
  { Icon: TruckIcon, title: 'Delivery In Malawi', text: 'Fast and reliable' },
  { Icon: ChatIcon, title: 'Order On WhatsApp', text: 'Quick replies' },
  { Icon: ShieldIcon, title: 'Quality Picks', text: 'Carefully selected pairs' },
];

const categories = ['Men', 'Women', 'Unisex'];

const formatCurrency = (priceValue) =>
  new Intl.NumberFormat('en-MW', {
    style: 'currency',
    currency: 'MWK',
    minimumFractionDigits: 0,
  })
    .format(priceValue)
    .replace('MWK', 'MK');

const Hero = () => {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState(0);
  const rowRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {});
  }, []);

  const withImages = products.filter((p) => p.images && p.images[0]);
  const slides = withImages.slice(0, 5);
  const newest = [...withImages].reverse().slice(0, 8);
  const current = slides[active] || null;

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const scrollToArrivals = () => {
    const el = document.getElementById('new-arrivals');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollRow = (direction) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: direction * 300, behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="bg-white">
        <div className="container mx-auto px-3 sm:px-4 pt-3 md:pt-5">
          <div className="relative overflow-hidden bg-primary min-h-[540px] md:min-h-[620px] flex items-end">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.25),transparent_60%)]"></div>

            {slides.map((product, i) => (
              <img
                key={product.id}
                src={product.images[0]}
                alt={product.name}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  i === active ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 md:bg-gradient-to-r md:from-black md:via-black/70 md:to-transparent"></div>

            {slides.length > 1 && (
              <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                {slides.map((product, i) => (
                  <button
                    key={product.id}
                    onClick={() => setActive(i)}
                    aria-label={`Show slide ${i + 1}`}
                    className={`h-1.5 transition-all duration-300 ${
                      i === active ? 'w-8 bg-accent' : 'w-4 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="relative z-10 w-full p-6 sm:p-10 md:p-14 pb-10 md:pb-14">
              <div className="max-w-xl">
                <span className="inline-block text-accent text-[11px] tracking-[0.3em] uppercase font-semibold mb-4">
                  New season collection
                </span>
                <h1 className="font-display text-secondary text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase leading-[1.05] tracking-tight mb-5">
                  Step into style.
                  <br />
                  <span className="text-accent">Dress with confidence.</span>
                </h1>
                <p className="text-secondary/80 text-base md:text-lg font-light mb-8 max-w-md">
                  Premium shoes, fashion bags and trendy apparel for men and women.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/shop"
                    className="px-8 py-4 bg-accent text-primary text-center text-sm font-bold uppercase tracking-wider hover:bg-hoverAccent transition-colors duration-300"
                  >
                    Shop Now
                  </Link>
                  <button
                    onClick={scrollToArrivals}
                    className="px-8 py-4 bg-transparent border border-secondary/60 text-secondary text-sm font-bold uppercase tracking-wider hover:bg-secondary hover:text-primary transition-colors duration-300"
                  >
                    View New Arrivals
                  </button>
                </div>
              </div>
            </div>

            {current && (
              <Link
                to="/shop"
                className="hidden md:block absolute bottom-14 right-14 z-10 w-64 bg-white/10 backdrop-blur-md border border-white/20 p-5 hover:bg-white/15 transition-colors"
              >
                <p className="text-accent text-[10px] tracking-[0.3em] uppercase font-semibold mb-2">Featured</p>
                <p className="text-secondary text-sm font-semibold line-clamp-2">{current.name}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-secondary font-extrabold">{formatCurrency(current.price)}</span>
                  <ArrowRightIcon className="w-4 h-4 text-accent" />
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-200 mt-3 md:mt-5 border-t">
        <div className="container mx-auto px-4 py-5 grid grid-cols-3 gap-2">
          {trustItems.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-center sm:text-left"
            >
              <Icon className="w-6 h-6 text-accent shrink-0" />
              <div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary">{title}</p>
                <p className="hidden sm:block text-xs text-gray-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-10 md:py-14">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="mb-6">
            <p className="text-accent text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] mb-1">
              Browse
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-primary">
              Shop By Category
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-5">
            {categories.map((name) => {
              const match = withImages.find((p) => p.gender && p.gender.toLowerCase() === name.toLowerCase());
              return (
                <Link
                  key={name}
                  to="/shop"
                  state={{ gender: name }}
                  className="group relative overflow-hidden bg-primary aspect-[3/4] flex items-end"
                >
                  {match && (
                    <img
                      src={match.images[0]}
                      alt={name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="relative z-10 p-3 md:p-5 w-full flex items-center justify-between">
                    <span className="font-display text-secondary text-sm md:text-xl font-extrabold uppercase tracking-wider">
                      {name}
                    </span>
                    <ArrowRightIcon className="hidden sm:block w-5 h-5 text-accent transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {newest.length > 0 && (
        <section id="new-arrivals" className="bg-neutralBg/60 py-10 md:py-14 scroll-mt-16">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-accent text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] mb-1">
                  Just in
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-primary">
                  New Arrivals
                </h2>
              </div>
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => scrollRow(-1)}
                  aria-label="Scroll left"
                  className="w-10 h-10 border border-gray-300 bg-white flex items-center justify-center hover:bg-primary hover:text-accent transition-colors"
                >
                  <ArrowRightIcon className="w-4 h-4 rotate-180" />
                </button>
                <button
                  onClick={() => scrollRow(1)}
                  aria-label="Scroll right"
                  className="w-10 h-10 border border-gray-300 bg-white flex items-center justify-center hover:bg-primary hover:text-accent transition-colors"
                >
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={rowRef}
              className="flex gap-3 md:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0 pb-2"
            >
              {newest.map((product) => (
                <Link
                  to="/shop"
                  key={product.id}
                  className="group snap-start shrink-0 w-44 md:w-60 bg-white border border-gray-100 hover:border-accent/40 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative overflow-hidden bg-neutralBg aspect-[4/5]">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 text-[9px] uppercase font-bold tracking-wider bg-accent text-primary px-2 py-1">
                      New
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-textDark font-semibold text-xs md:text-sm line-clamp-1">{product.name}</p>
                    <p className="text-primary font-extrabold text-sm mt-1">{formatCurrency(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Hero;