'use client';

import { useState, useEffect } from 'react';
import { Package, Trash2, Edit2, X } from 'lucide-react';
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

export default function DataEntryTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCode(p.code);
    setCategory(p.category);
    setStock(p.stock.toString());
    setSalePrice(p.salePrice ? p.salePrice.toString() : '');
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setName('');
    setCode('');
    setCategory('');
    setStock('');
    setSalePrice('');
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const parsedCode = parseFloat(code);
    if (isNaN(parsedCode)) {
      alert('Product code must be a number!');
      return;
    }
    const costPrice = parsedCode / 3;

    const url = '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';
    const body = JSON.stringify({ 
      id: editingProduct?.id,
      name, 
      code, 
      costPrice,
      category: category || 'General',
      stock: parseInt(stock) || 0,
      salePrice: parseFloat(salePrice) || 0
    });

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (res.ok) {
      window.dispatchEvent(new Event('sale-updated'));
      toast.success(editingProduct ? 'Product updated!' : 'Product added to inventory!');
      setName('');
      setCode('');
      setCategory('');
      setStock('');
      setSalePrice('');
      setEditingProduct(null);
      fetchProducts();
    } else {
      const err = await res.json();
      toast.error('Error: ' + (err.error || 'Failed to save product'));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-md h-fit">
        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${editingProduct ? 'text-blue-600' : 'text-purple-600'}`}>
          {editingProduct ? <Edit2 size={24} /> : <Package size={24} />}
          {editingProduct ? 'Edit Product' : 'Add Product'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-gray-50 p-2 border text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-gray-50 p-2 border text-black font-bold"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-1 italic">Create categories in Admin &rarr; Categories</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-gray-50 p-2 border text-black"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Code (Cost*3)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-gray-50 p-2 border text-black"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Cost: {code ? (parseFloat(code) / 3).toFixed(2) : 0}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sale Price</label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 bg-gray-50 p-2 border text-black"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className={`flex-1 text-white py-2 px-4 rounded-md transition-colors font-semibold ${editingProduct ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {editingProduct ? 'Update Product' : 'Save Product'}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-100 text-gray-600 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-semibold flex items-center gap-1"
              >
                <X size={16} /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Product List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Code</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Sale Price</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(products) && products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{p.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-bold">{(parseFloat(p.code) / 3).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-green-600 font-bold">{p.salePrice?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-bold ${p.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this product?')) {
                            const res = await fetch(`/api/products?id=${p.id}`, { method: 'DELETE' });
                            if (res.ok) {
                              toast.success('Product deleted');
                              fetchProducts();
                              window.dispatchEvent(new Event('sale-updated'));
                            }
                          }
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
