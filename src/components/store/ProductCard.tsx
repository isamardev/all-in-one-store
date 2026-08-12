'use client';

import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/lib/cart';

interface Product {
  id: number;
  name: string;
  salePrice: number;
  stock: number;
  image: string | null;
  category: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    if (product.stock <= 0) {
      toast.error('Out of stock!');
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.salePrice,
      image: product.image,
      stock: product.stock,
    });
    toast.success('Added to cart!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl font-black">
            {product.name.charAt(0)}
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xl font-black text-gray-900">Rs. {product.salePrice.toFixed(0)}</span>
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
