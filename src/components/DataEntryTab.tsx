'use client';

import { useState, useEffect } from 'react';
import { Package, Trash2, Edit2, X, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  code: string;
  costPrice: number;
  category: string;
  stock: number;
  salePrice?: number;
  image?: string | null;
}

interface Category {
  id: number;
  name: string;
}

export default function DataEntryTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Add product form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editSalePrice, setEditSalePrice] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) { toast.error('Image max 500KB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (isEdit) setEditImage(reader.result as string);
      else setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    const handleUpdate = () => {
      fetchProducts();
      fetchCategories();
    };
    window.addEventListener('sale-updated', handleUpdate);
    return () => window.removeEventListener('sale-updated', handleUpdate);
  }, []);

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditCode(p.code);
    setEditCategory(p.category);
    setEditStock(p.stock.toString());
    setEditSalePrice(p.salePrice ? p.salePrice.toString() : '');
    setEditImage(p.image || null);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditName('');
    setEditCode('');
    setEditCategory('');
    setEditStock('');
    setEditSalePrice('');
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const parsedCode = parseFloat(code);
    if (isNaN(parsedCode)) {
      alert('Product code must be a number!');
      return;
    }
    const costPrice = parsedCode / 3;

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        code, 
        costPrice,
        category: category || 'General',
        stock: parseInt(stock) || 0,
        salePrice: parseFloat(salePrice) || 0,
        image,
      }),
    });

    if (res.ok) {
      window.dispatchEvent(new Event('sale-updated'));
      toast.success('Product added to inventory!');
      setName('');
      setCode('');
      setCategory('');
      setStock('');
      setSalePrice('');
      setImage(null);
      fetchProducts();
    } else {
      const err = await res.json();
      toast.error('Error: ' + (err.error || 'Failed to save product'));
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editName || !editCode) return;

    const parsedCode = parseFloat(editCode);
    if (isNaN(parsedCode)) {
      alert('Product code must be a number!');
      return;
    }
    const costPrice = parsedCode / 3;

    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: editingProduct.id,
        name: editName, 
        code: editCode, 
        costPrice,
        category: editCategory || 'General',
        stock: parseInt(editStock) || 0,
        salePrice: parseFloat(editSalePrice) || 0,
        image: editImage,
      }),
    });

    if (res.ok) {
      window.dispatchEvent(new Event('sale-updated'));
      toast.success('Product updated!');
      closeEditModal();
      fetchProducts();
    } else {
      const err = await res.json();
      toast.error('Error: ' + (err.error || 'Failed to update product'));
    }
  };

  // Filter and search products
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Add Product Form */}
      <div className="bg-white p-6 rounded-xl shadow-md h-fit">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-600">
          <Package size={24} />
          Add Product
        </h2>
        <form onSubmit={handleAddProduct} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Image</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} className="mt-1 block w-full text-sm text-gray-500" />
            {image && <img src={image} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />}
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors font-semibold"
          >
            Save Product
          </button>
        </form>
      </div>

      {/* Product List */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Product List</h2>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
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
              {Array.isArray(filteredProducts) && filteredProducts.map((p) => (
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
                        onClick={() => openEditModal(p)}
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

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Edit2 size={20} className="text-blue-600" />
                Edit Product
              </h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 border text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 border text-black font-bold"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 border text-black"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Code (Cost*3)</label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 border text-black"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Cost: {editCode ? (parseFloat(editCode) / 3).toFixed(2) : 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sale Price</label>
                  <input
                    type="number"
                    value={editSalePrice}
                    onChange={(e) => setEditSalePrice(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 border text-black"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="mt-1 block w-full text-sm text-gray-500" />
                {editImage && <img src={editImage} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />}
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors font-semibold"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
