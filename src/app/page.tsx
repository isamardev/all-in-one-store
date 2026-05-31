'use client';

import { useState, useEffect } from 'react';
import SaleTab from '@/components/SaleTab';
import ReportsTab from '@/components/ReportsTab';
import DataEntryTab from '@/components/DataEntryTab';
import ExpenseTab from '@/components/ExpenseTab';
import CategoryTab from '@/components/CategoryTab';
import Dashboard from '@/components/Dashboard';
import { ShoppingBag, FileBarChart, Database, CreditCard, Store, Lock, LogOut, ChevronDown, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const [activeTab, setActiveTab] = useState('sale');
  const [isPanelLoggedIn, setIsPanelLoggedIn] = useState(false);
  const [panelPassword, setPanelPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  useEffect(() => {
    const savedPanelLogin = localStorage.getItem('pos_panel_login');
    if (savedPanelLogin === 'true') {
      setIsPanelLoggedIn(true);
    }
    // Admin login is now session-only, removed from here
  }, []);

  const handlePanelLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (panelPassword === '3724') {
      setIsPanelLoggedIn(true);
      localStorage.setItem('pos_panel_login', 'true');
      setPanelPassword('');
      toast.success('Welcome to POS Panel!');
    } else {
      toast.error('Incorrect password!');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '3724') { // Updated password
      setIsAdminLoggedIn(true);
      // Admin login is session-only, not saving to localStorage
      setShowAdminLogin(false);
      setAdminPassword('');
      toast.success('Admin access granted!');
    } else {
      toast.error('Incorrect password!');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setIsPanelLoggedIn(false);
    localStorage.removeItem('pos_panel_login');
    setActiveTab('sale');
    setShowAdminDropdown(false);
    toast.success('Logged out successfully');
  };

  if (!isPanelLoggedIn) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in duration-500">
          <div className="bg-blue-600 p-4 rounded-2xl inline-block mb-6 shadow-xl shadow-blue-200">
            <Store className="text-white" size={48} />
          </div>
          <h1 className="text-4xl font-black text-gray-800 mb-2">POS <span className="text-blue-600">PRO</span></h1>
          <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest text-xs">Terminal Access Login</p>
          
          <form onSubmit={handlePanelLogin} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Panel Password</label>
              <input
                type="password"
                autoFocus
                value={panelPassword}
                onChange={(e) => setPanelPassword(e.target.value)}
                placeholder="••••"
                className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all text-black font-black text-center text-2xl tracking-[0.5em]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all text-lg"
            >
              Enter POS Panel
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-[95%] mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('sale')}>
            <div className="bg-blue-600 p-2 rounded-xl shadow-blue-200 shadow-lg">
              <Store className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">POS <span className="text-blue-600 uppercase">Pro</span></h1>
          </div>
          
          <nav className="flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
            <button
              onClick={() => { setActiveTab('sale'); setIsAdminLoggedIn(false); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'sale' 
                ? 'bg-white text-blue-600 shadow-md scale-105' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ShoppingBag size={18} /> Sale
            </button>
            <button
              onClick={() => { setActiveTab('expense'); setIsAdminLoggedIn(false); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'expense' 
                ? 'bg-white text-blue-600 shadow-md scale-105' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CreditCard size={18} /> Expenses
            </button>

            {/* Admin Section */}
            <div className="relative ml-2">
              {!isAdminLoggedIn ? (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-blue-600 transition-all border-l border-gray-300 ml-2"
                >
                  <Lock size={18} /> Admin
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all border-l border-gray-300 ml-2 ${
                      activeTab === 'reports' || activeTab === 'data-entry' 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <Database size={18} /> Admin Panel <ChevronDown size={14} />
                  </button>
                  
                  {showAdminDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <button
                        onClick={() => { setActiveTab('data-entry'); setShowAdminDropdown(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Database size={16} /> Inventory
                      </button>
                      <button
                        onClick={() => { setActiveTab('category'); setShowAdminDropdown(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Tag size={16} /> Categories
                      </button>
                      <button
                        onClick={() => { setActiveTab('reports'); setShowAdminDropdown(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <FileBarChart size={16} /> Reports
                      </button>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-blue-100 p-4 rounded-2xl mb-4">
                <Lock className="text-blue-600" size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-800">Admin Login</h2>
              <p className="text-gray-500 text-sm">Enter password to access admin features</p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="password"
                autoFocus
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter Admin Password"
                className="w-full p-4 bg-gray-100 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all text-black font-bold text-center"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-[95%] mx-auto px-4 mt-6">
        {/* Header Section - Enhanced & Compact */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl">
              <ShoppingBag className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {activeTab === 'sale' && "Terminal POS"}
              {activeTab === 'reports' && "Analytics"}
              {activeTab === 'data-entry' && "Warehouse"}
              {activeTab === 'category' && "Product Categories"}
              {activeTab === 'expense' && "Cash Flow"}
            </h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">Cloud Sync Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        {/* Main Action Area */}
        <div className="order-1">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            {activeTab === 'sale' && <SaleTab />}
            {activeTab === 'reports' && isAdminLoggedIn && <ReportsTab />}
            {activeTab === 'data-entry' && isAdminLoggedIn && <DataEntryTab />}
            {activeTab === 'category' && isAdminLoggedIn && <CategoryTab />}
            {activeTab === 'expense' && <ExpenseTab />}
          </div>
        </div>
      </div>
    </div>
    </main>
  );
}
