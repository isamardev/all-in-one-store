'use client';

import { useState, useEffect } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  code: string;
  costPrice: number;
  category: string;
  stock: number;
}

interface Category {
  id: number;
  name: string;
}

export default function SaleTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New Product State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newStock, setNewStock] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Listen for updates from other tabs
    window.addEventListener('sale-updated', () => {
      fetchProducts();
      fetchCategories();
    });
    return () => window.removeEventListener('sale-updated', () => {
      fetchProducts();
      fetchCategories();
    });
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Expected array of products, got:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    }
  };

  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !salePrice || isProcessing) return;

    const product = products.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;

    setIsProcessing(true);
    const loadingToast = toast.loading('Recording sale...');

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          salePrice: parseFloat(salePrice),
          code: product.code
        }),
      });

      if (res.ok) {
        window.dispatchEvent(new Event('sale-updated'));
        toast.success('Sale recorded successfully!', { id: loadingToast });
        setSalePrice('');
        setSelectedProductId('');
        setSelectedCategory(''); // Reset category as requested
      } else {
        const err = await res.json();
        toast.error('Error: ' + (err.error || 'Failed to record sale'), { id: loadingToast });
      }
    } catch (error: any) {
      toast.error('System Error: ' + error.message, { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddNewAndSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode || !salePrice || isProcessing) return;

    setIsProcessing(true);
    const loadingToast = toast.loading('Adding product and recording sale...');
    try {
      // 1. Create Product
      const parsedCode = parseFloat(newCode);
      if (isNaN(parsedCode)) {
        toast.error('Product code must be a number!', { id: loadingToast });
        setIsProcessing(false);
        return;
      }
      const costPrice = parsedCode / 3;
      const prodRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newName, 
          code: newCode, 
          costPrice,
          category: newCategory || 'General',
          stock: (parseInt(newStock) || 0)
        }),
      });

      if (!prodRes.ok) {
        const err = await prodRes.json();
        toast.error('Error adding product: ' + (err.error || 'Unknown error'), { id: loadingToast });
        setIsProcessing(false);
        return;
      }

      const newProduct = await prodRes.json();
      
      // 2. Record Sale
      const saleRes = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newProduct.id,
          salePrice: parseFloat(salePrice),
          code: newCode
        }),
      });

      if (saleRes.ok) {
        window.dispatchEvent(new Event('sale-updated'));
        toast.success('Product added and Sale recorded!', { id: loadingToast });
        setNewName('');
        setNewCode('');
        setNewCategory('');
        setNewStock('');
        setSalePrice('');
        setIsAddingNew(false);
        setSelectedCategory(''); // Reset selection
        setSelectedProductId('');
        fetchProducts();
      } else {
        const err = await saleRes.json();
        toast.error('Error recording sale: ' + (err.error || 'Unknown error'), { id: loadingToast });
      }
    } catch (error: any) {
      toast.error('System Error: ' + error.message, { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h2 className="text-3xl font-black flex items-center gap-3 text-gray-800">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <ShoppingCart size={24} />
            </div>
            New Sale
          </h2>
          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
              isAddingNew 
              ? 'bg-gray-100 text-gray-600' 
              : 'bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700'
            }`}
          >
            {isAddingNew ? "Back to Sale" : <><Plus size={18} /> Add New Product</>}
          </button>
        </div>

        {!isAddingNew ? (
          <form onSubmit={handleSale} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">1. Select Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedProductId(''); // Reset product when category changes
                  }}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all text-black font-bold appearance-none shadow-inner"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">2. Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all text-black font-bold appearance-none shadow-inner"
                  required
                >
                  <option value="">Select a product</option>
                  {filteredProducts.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                      {p.name} {p.stock <= 0 ? '(Out of Stock)' : `(Stock: ${p.stock})`} - {p.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              {/* Sale Price */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">3. Enter Sale Price</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</div>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all text-black font-black text-xl shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full p-4 text-white rounded-2xl transition-all font-black text-lg shadow-xl flex items-center justify-center gap-3 ${
                  isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Complete Sale'} <ShoppingCart size={20} />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddNewAndSale} className="space-y-6 relative z-10">
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-6">
              <h3 className="text-blue-800 font-black text-lg mb-4">Register New Item</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-tighter ml-1">Product Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-3 bg-white rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 text-black font-bold"
                    required
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-tighter ml-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-3 bg-white rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 text-black font-bold"
                    required
                    disabled={isProcessing}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-tighter ml-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full p-3 bg-white rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 text-black font-bold"
                    placeholder="0"
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-tighter ml-1">Product Code</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full p-3 bg-white rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 text-black font-bold"
                    required
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Sale Price for this item</label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-green-600 outline-none transition-all text-black font-black text-xl shadow-inner"
                required
                disabled={isProcessing}
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full p-5 text-white rounded-2xl transition-all font-black text-xl shadow-xl ${
                isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-100'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Save Product & Complete Sale'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
