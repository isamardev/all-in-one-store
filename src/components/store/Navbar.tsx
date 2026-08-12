'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Store } from 'lucide-react';
import { useCart } from '@/lib/cart';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { count } = useCart();

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCategories(data);
    });
  }, []);

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Store className="text-white" size={22} />
          </div>
          <span className="text-xl font-black text-gray-800">All In One <span className="text-blue-600">Store</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
            Home
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <Link href="/cart" className="relative p-3 bg-gray-100 rounded-xl hover:bg-blue-50 transition-all">
          <ShoppingCart size={22} className="text-gray-700" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile categories */}
      <div className="md:hidden border-t px-4 py-2 flex gap-2 overflow-x-auto">
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-full whitespace-nowrap"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </header>
  );
}
