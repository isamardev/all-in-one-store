'use client';

import { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Trash2, CheckCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  code: string;
  costPrice: number;
  category: string;
  stock: number;
  salePrice?: number;
}

interface Category {
  id: number;
  name: string;
}

interface CartItem {
  id: string; // temp unique id for cart
  productId: number;
  name: string;
  code: string;
  salePrice: number;
  quantity: number;
  discount: number;
}

export default function SaleTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [discount, setDiscount] = useState<string>('0');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // New Product State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newSalePrice, setNewSalePrice] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Listen for updates from other tabs
    const handleUpdate = () => {
      fetchProducts();
      fetchCategories();
    };
    window.addEventListener('sale-updated', handleUpdate);
    return () => window.removeEventListener('sale-updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === parseInt(selectedProductId));
      if (product) {
        setSalePrice(product.salePrice?.toString() || '');
      }
    } else {
      setSalePrice('');
    }
  }, [selectedProductId, products]);

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
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    }
  };

  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !salePrice) return;

    const product = products.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;

    const qty = parseInt(quantity) || 1;
    const disc = parseFloat(discount) || 0;

    if (product.stock < qty) {
      toast.error(`Only ${product.stock} items left in stock!`);
      return;
    }

    // Check if item already exists in cart with SAME product ID and SAME unit price
    const existingItemIndex = cart.findIndex(item => item.productId === product.id && item.salePrice === parseFloat(salePrice));

    if (existingItemIndex > -1) {
      // Merge with existing item
      const updatedCart = [...cart];
      const existingItem = updatedCart[existingItemIndex];
      
      // Check total stock if merged
      if (product.stock < existingItem.quantity + qty) {
        toast.error(`Cannot add more. Total in cart would exceed stock (${product.stock})`);
        return;
      }

      updatedCart[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + qty,
        discount: existingItem.discount + disc
      };
      setCart(updatedCart);
      toast.success('Cart updated (merged)!');
    } else {
      // Add as new item
      const newItem: CartItem = {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.name,
        code: product.code,
        salePrice: parseFloat(salePrice),
        quantity: qty,
        discount: disc
      };
      setCart([...cart, newItem]);
      toast.success('Added to cart!');
    }

    setSalePrice('');
    setQuantity('1');
    setDiscount('0');
    setSelectedProductId('');
  };

  const handleAddNewToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode || !salePrice || isProcessing) return;

    setIsProcessing(true);
    const loadingToast = toast.loading('Adding new product to inventory...');
    try {
      // 1. Create Product first (so it shows in inventory)
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
          stock: (parseInt(newStock) || 0),
          salePrice: parseFloat(newSalePrice) || 0
        }),
      });

      if (!prodRes.ok) {
        const err = await prodRes.json();
        toast.error('Error adding product: ' + (err.error || 'Unknown error'), { id: loadingToast });
        setIsProcessing(false);
        return;
      }

      const newProduct = await prodRes.json();
      
      // 2. Add to Cart
      const qty = parseInt(quantity) || 1;
      const disc = parseFloat(discount) || 0;

      const newItem: CartItem = {
        id: Math.random().toString(36).substr(2, 9),
        productId: newProduct.id,
        name: newProduct.name,
        code: newProduct.code,
        salePrice: parseFloat(salePrice),
        quantity: qty,
        discount: disc
      };

      setCart([...cart, newItem]);
      
      // Reset form
      setNewName('');
      setNewCode('');
      setNewCategory('');
      setNewStock('');
      setNewSalePrice('');
      setSalePrice('');
      setQuantity('1');
      setDiscount('0');
      setIsAddingNew(false);
      
      // Refresh inventory
      window.dispatchEvent(new Event('sale-updated'));
      toast.success('Product added to inventory and cart!', { id: loadingToast });
    } catch (error: any) {
      toast.error('System Error: ' + error.message, { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
    toast.success('Removed from cart');
  };

  const confirmAllSales = async () => {
    if (cart.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const loadingToast = toast.loading(`Processing ${cart.length} sales...`);

    try {
      let successCount = 0;
      for (const item of cart) {
        const res = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            salePrice: item.salePrice,
            code: item.code,
            quantity: item.quantity,
            discount: item.discount
          }),
        });
        if (res.ok) successCount++;
      }

      if (successCount === cart.length) {
        toast.success('All sales recorded successfully!', { id: loadingToast });
        setCart([]);
        window.dispatchEvent(new Event('sale-updated'));
      } else {
        toast.error(`Recorded ${successCount} of ${cart.length} sales.`, { id: loadingToast });
        setCart([]); 
        window.dispatchEvent(new Event('sale-updated'));
      }
    } catch (error: any) {
      toast.error('System Error: ' + error.message, { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.salePrice * item.quantity) - item.discount, 0);

  return (
    <div className="w-full space-y-8">
      {/* Sale Form Section */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
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
          <form onSubmit={handleAddToCart} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">1. Select Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedProductId('');
                  }}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all text-black font-bold appearance-none shadow-inner"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">3. Sale Price (Unit)</label>
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

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">4. Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all text-black font-black text-xl shadow-inner"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">5. Discount (Optional)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</div>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                    className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all text-black font-black text-xl shadow-inner"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-4 bg-blue-600 text-white rounded-2xl transition-all font-black text-lg shadow-xl hover:bg-blue-700 shadow-blue-200 flex items-center justify-center gap-3"
            >
              Add to Cart <Plus size={20} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleAddNewToCart} className="space-y-6 relative z-10">
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
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-tighter ml-1">Default Sale Price</label>
                  <input
                    type="number"
                    value={newSalePrice}
                    onChange={(e) => setNewSalePrice(e.target.value)}
                    className="w-full p-3 bg-white rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 text-black font-bold"
                    placeholder="0.00"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Sale Price (Unit)</label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-green-600 outline-none transition-all text-black font-black text-xl shadow-inner"
                  required
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-green-600 outline-none transition-all text-black font-black text-xl shadow-inner"
                  required
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Discount (Optional)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-green-600 outline-none transition-all text-black font-black text-xl shadow-inner"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full p-5 text-white rounded-2xl transition-all font-black text-xl shadow-xl ${
                isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-100'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Add New to Cart & Inventory'}
            </button>
          </form>
        )}
      </div>

      {/* Cart Section */}
      {cart.length > 0 && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 animate-in fade-in slide-in-from-bottom-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <ShoppingCart size={24} className="text-blue-600" /> 
              Shopping Cart 
              <span className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full">{cart.length} items</span>
            </h3>
            <button 
              onClick={() => setCart([])}
              className="text-red-500 text-sm font-bold hover:underline"
            >
              Clear Cart
            </button>
          </div>

          <div className="space-y-3 mb-8">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 group">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <Package size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-black text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Code: {item.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className="font-black text-gray-900 text-lg">Rs. {item.salePrice.toFixed(2)}</p>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 p-6 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Bill Amount</p>
              <p className="text-4xl font-black">Rs. {totalAmount.toFixed(2)}</p>
            </div>
            <button
              onClick={confirmAllSales}
              disabled={isProcessing}
              className={`w-full md:w-auto px-10 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all ${
                isProcessing 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-900/20'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Confirm Sale'} <CheckCircle size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
