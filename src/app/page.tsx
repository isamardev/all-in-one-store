'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/store/Navbar';
import Hero from '@/components/store/Hero';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';

interface Category { id: number; name: string; slug: string; }
interface Product { id: number; name: string; salePrice: number; stock: number; image: string | null; category: string; }

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([cats, prods]) => {
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(prods)) setProducts(prods);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <Hero />
      <main id="products" className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full">
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No products yet. Admin se categories aur products add karein.</p>
          </div>
        ) : (
          categories.map(cat => {
            const catProducts = products.filter(p => p.category === cat.name && p.stock >= 0);
            if (catProducts.length === 0) return null;
            return (
              <section key={cat.id} className="mb-12">
                <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-blue-600 rounded-full" />
                  {cat.name}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {catProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            );
          })
        )}
      </main>
      <Footer />
    </div>
  );
}
