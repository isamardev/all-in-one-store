'use client';

import { useState, useEffect } from 'react';
import DataEntryTab from '@/components/DataEntryTab';
import CategoryTab from '@/components/CategoryTab';
import { Database, Store, LogOut, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('data-entry');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const savedLogin = localStorage.getItem('admin_login');
    if (savedLogin === 'true') setIsLoggedIn(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '3724') {
      setIsLoggedIn(true);
      localStorage.setItem('admin_login', 'true');
      setPassword('');
      toast.success('Welcome to Admin Panel!');
    } else {
      toast.error('Incorrect password!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_login');
    setActiveTab('data-entry');
    toast.success('Logged out successfully');
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border border-gray-100 text-center">
          <div className="bg-blue-600 p-4 rounded-2xl inline-block mb-6 shadow-xl shadow-blue-200">
            <Store className="text-white" size={48} />
          </div>
          <h1 className="text-4xl font-black text-gray-800 mb-2">Admin <span className="text-blue-600">Panel</span></h1>
          <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-xs">Store Management Login</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••" className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none text-black font-black text-center text-2xl tracking-[0.5em]" />
            <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all text-lg">
              Enter Admin Panel
            </button>
          </form>
          <Link href="/" className="block mt-4 text-sm text-blue-600 font-bold hover:underline">← Back to Store</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-[95%] mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-xl shadow-blue-200 shadow-lg"><Store className="text-white" size={24} /></div>
              <h1 className="text-2xl font-black text-gray-800">Admin <span className="text-blue-600">Panel</span></h1>
            </div>
            <Link href="/" className="text-xs font-bold text-blue-600 hover:underline">View Store →</Link>
          </div>
          <nav className="flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200 flex-wrap">
            <button onClick={() => setActiveTab('data-entry')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'data-entry' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
              <Database size={18} /> Products
            </button>
            <button onClick={() => setActiveTab('category')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'category' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
              <Tag size={18} /> Categories
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:text-red-600 border-l border-gray-300 ml-2">
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-[95%] mx-auto px-4 pt-6 min-h-[90vh] flex flex-col">
        {activeTab === 'data-entry' && <DataEntryTab />}
        {activeTab === 'category' && <CategoryTab />}
      </div>
    </main>
  );
}
