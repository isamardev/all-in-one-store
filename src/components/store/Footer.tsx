import Link from 'next/link';
import { Store } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Store className="text-white" size={20} />
              </div>
              <span className="text-lg font-black text-white">All In One Store</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">Your trusted online shop for quality products.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/cart" className="hover:text-white transition-colors">Cart</Link>
              <Link href="/admin" className="hover:text-white transition-colors">Admin Panel</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} All In One Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
