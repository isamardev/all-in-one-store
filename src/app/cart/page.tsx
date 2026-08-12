'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import { useCart } from '@/lib/cart';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
        <h1 className="text-3xl font-black text-gray-800 mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 mb-6">Cart khali hai</p>
            <Link href="/" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div key={item.productId} className="bg-white rounded-2xl p-4 flex gap-4 items-center border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-gray-300">{item.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                    <p className="text-blue-600 font-black">Rs. {item.price.toFixed(0)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200">
                      <Minus size={16} />
                    </button>
                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200">
                      <Plus size={16} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-600">Total</span>
                <span className="text-2xl font-black text-gray-900">Rs. {total.toFixed(0)}</span>
              </div>
              <Link
                href="/checkout"
                className="block w-full text-center bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all"
              >
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
