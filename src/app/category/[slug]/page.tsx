'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';

interface Product { id: number; name: string; salePrice: number; compareAtPrice?: number; stock: number; image: string | null; category: string; }

export default function CategoryPage() {
  const { slug } = useParams();
  const [categoryName, setCategoryName] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(cats => {
      if (Array.isArray(cats)) {
        const cat = cats.find((c: any) => c.slug === slug);
        if (cat) {
          setCategoryName(cat.name);
          fetch(`/api/products?category=${encodeURIComponent(cat.name)}`)
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setProducts(data); });
        }
      }
    });
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10 flex-1 w-full">
        <h1 className="text-3xl font-black text-gray-800 mb-8">{categoryName || 'Category'}</h1>
        {products.length === 0 ? (
          <p className="text-gray-400 text-center py-20">Is category mai abhi koi product nahi hai.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
