'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import { useCart } from '@/lib/cart';
import { CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      toast.error('Saari fields fill karein');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          phone,
          address,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderId(data.orderId);
        clearCart();
        toast.success('Order confirmed!');
      } else {
        toast.error(data.error || 'Order failed');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  if (items.length === 0 && !orderId) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Cart khali hai</p>
            <Link href="/" className="text-blue-600 font-bold">Go to Shop</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-10 text-center shadow-xl max-w-md w-full">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-gray-800 mb-2">Order Confirmed!</h1>
            <p className="text-gray-500 mb-2">Order ID: <span className="font-bold text-gray-800">#{orderId}</span></p>
            <p className="text-gray-500 mb-6">Jald hi aap se contact kiya jayega.</p>
            <Link href="/" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all">
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full">
        <h1 className="text-3xl font-black text-gray-800 mb-8">Checkout</h1>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
          <h2 className="font-bold text-gray-700 mb-4">Order Summary</h2>
          {items.map(item => (
            <div key={item.productId} className="flex justify-between text-sm py-2 border-b border-gray-50">
              <span>{item.name} x{item.quantity}</span>
              <span className="font-bold">Rs. {(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-4 font-black text-lg">
            <span>Total</span>
            <span>Rs. {total.toFixed(0)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-600">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="w-full mt-1 p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-600 outline-none text-black font-medium" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} required type="tel"
              className="w-full mt-1 p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-600 outline-none text-black font-medium" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600">Address</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} required rows={3}
              className="w-full mt-1 p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-600 outline-none text-black font-medium resize-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 disabled:bg-gray-400 transition-all">
            {loading ? 'Placing Order...' : 'Confirm Order'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
