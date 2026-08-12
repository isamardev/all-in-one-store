'use client';

import { useState, useEffect } from 'react';
import { Package, Trash2, Edit2, X, Search, Filter, ImagePlus, Tag, DollarSign, FileText, Boxes } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description?: string | null;
  category: string;
  stock: number;
  salePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string | null;
  image?: string | null;
  images?: string | null;
  status?: string;
}

interface Category {
  id: number;
  name: string;
}

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 500000;

function parseProductImages(product: Product): string[] {
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { /* fall through */ }
  }
  return product.image ? [product.image] : [];
}

function calcDiscount(compareAt: number, sale: number) {
  if (!compareAt || compareAt <= sale) return 0;
  return Math.round(((compareAt - sale) / compareAt) * 100);
}

const emptyForm = {
  name: '',
  description: '',
  category: '',
  stock: '',
  salePrice: '',
  compareAtPrice: '',
  costPrice: '',
  sku: '',
  status: 'active',
  images: [] as string[],
};

export default function DataEntryTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {
      console.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?admin=true');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const current = isEdit ? editForm.images : form.images;
    if (current.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    files.forEach(file => {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} is too large (max 500KB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (isEdit) {
          setEditForm(prev => ({ ...prev, images: [...prev.images, result] }));
        } else {
          setForm(prev => ({ ...prev, images: [...prev.images, result] }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    } else {
      setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    }
  };

  const buildPayload = (f: typeof emptyForm) => ({
    name: f.name,
    description: f.description,
    category: f.category || 'General',
    stock: parseInt(f.stock) || 0,
    salePrice: parseFloat(f.salePrice) || 0,
    compareAtPrice: parseFloat(f.compareAtPrice) || 0,
    costPrice: parseFloat(f.costPrice) || 0,
    sku: f.sku || null,
    images: f.images,
    status: f.status,
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.salePrice) {
      toast.error('Title and selling price are required');
      return;
    }
    if (form.images.length === 0) {
      toast.error('At least one product image is required');
      return;
    }

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(form)),
    });

    if (res.ok) {
      toast.success('Product created successfully!');
      setForm(emptyForm);
      fetchProducts();
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to save product');
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditForm({
      name: p.name,
      description: p.description || '',
      category: p.category,
      stock: p.stock.toString(),
      salePrice: p.salePrice.toString(),
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toString() : '',
      costPrice: p.costPrice ? p.costPrice.toString() : '',
      sku: p.sku || '',
      status: p.status || 'active',
      images: parseProductImages(p),
    });
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditForm(emptyForm);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editForm.name || !editForm.salePrice) return;

    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingProduct.id, ...buildPayload(editForm) }),
    });

    if (res.ok) {
      toast.success('Product updated!');
      closeEditModal();
      fetchProducts();
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to update product');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const renderProductForm = (
    f: typeof emptyForm,
    setF: React.Dispatch<React.SetStateAction<typeof emptyForm>>,
    isEdit: boolean,
    onSubmit: (e: React.FormEvent) => void,
    submitLabel: string
  ) => {
    const discount = calcDiscount(parseFloat(f.compareAtPrice) || 0, parseFloat(f.salePrice) || 0);

    return (
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText size={16} className="text-purple-600" /> Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={f.name}
                onChange={e => setF(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Wireless Bluetooth Headphones"
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-black focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea
                value={f.description}
                onChange={e => setF(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your product — features, materials, size, etc."
                rows={4}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-black focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-y"
              />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ImagePlus size={16} className="text-purple-600" /> Media {!isEdit && '*'}
          </h3>
          <div className="flex flex-wrap gap-3 mb-3">
            {f.images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img} alt={`Product ${i + 1}`} className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Main</span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i, isEdit)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {f.images.length < MAX_IMAGES && (
              <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                <ImagePlus size={20} className="text-gray-400" />
                <span className="text-[10px] text-gray-400 font-bold mt-1">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageUpload(e, isEdit)} />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">Up to {MAX_IMAGES} images, max 500KB each. First image is the main product image.</p>
        </div>

        {/* Pricing */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-purple-600" /> Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Compare-at Price (MRP)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={f.compareAtPrice}
                  onChange={e => setF(prev => ({ ...prev, compareAtPrice: e.target.value }))}
                  placeholder="Original price"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-3 text-black focus:border-purple-500 outline-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Shown crossed out on store</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Selling Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={f.salePrice}
                  onChange={e => setF(prev => ({ ...prev, salePrice: e.target.value }))}
                  placeholder="Price after discount"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-3 text-black focus:border-purple-500 outline-none"
                  required
                />
              </div>
              {discount > 0 && (
                <p className="text-xs text-green-600 font-bold mt-1">{discount}% OFF</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Cost per Item</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={f.costPrice}
                  onChange={e => setF(prev => ({ ...prev, costPrice: e.target.value }))}
                  placeholder="Your cost (optional)"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-3 text-black focus:border-purple-500 outline-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Not shown to customers</p>
            </div>
          </div>
        </div>

        {/* Inventory & Organization */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Boxes size={16} className="text-purple-600" /> Inventory & Organization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                value={f.sku}
                onChange={e => setF(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="e.g. WH-001"
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-black focus:border-purple-500 outline-none font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={f.stock}
                onChange={e => setF(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="0"
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-black focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Tag size={14} /> Category *
              </label>
              <select
                value={f.category}
                onChange={e => setF(prev => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-black focus:border-purple-500 outline-none font-bold"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
              <select
                value={f.status}
                onChange={e => setF(prev => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-black focus:border-purple-500 outline-none font-bold"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl transition-colors font-black text-lg shadow-lg shadow-purple-200"
        >
          {submitLabel}
        </button>
      </form>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-8 pb-12">
      {/* Create Product Form */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-black mb-2 flex items-center gap-2 text-purple-600">
          <Package size={24} />
          Create Product
        </h2>
        <p className="text-sm text-gray-400 mb-6">Add a new product to your online store</p>
        {renderProductForm(form, setForm, false, handleAddProduct, 'Create Product')}
      </div>

      {/* Product List */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-black text-gray-800">All Products ({filteredProducts.length})</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-black"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-black"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
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
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(p => {
                const imgs = parseProductImages(p);
                const discount = calcDiscount(p.compareAtPrice || 0, p.salePrice);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {imgs[0] ? (
                          <img src={imgs[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold">{p.name.charAt(0)}</div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-900">{p.name}</p>
                          {p.sku && <p className="text-xs text-gray-400 font-mono">{p.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{p.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-black text-green-600">Rs. {p.salePrice.toFixed(0)}</p>
                      {(p.compareAtPrice || 0) > p.salePrice && (
                        <p className="text-xs text-gray-400 line-through">Rs. {p.compareAtPrice!.toFixed(0)} {discount > 0 && <span className="text-green-600 no-underline font-bold">-{discount}%</span>}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm ${p.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'draft' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                        {p.status === 'draft' ? 'Draft' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(p)} className="text-blue-500 hover:text-blue-700"><Edit2 size={18} /></button>
                        <button
                          onClick={async () => {
                            if (confirm('Delete this product?')) {
                              const res = await fetch(`/api/products?id=${p.id}`, { method: 'DELETE' });
                              if (res.ok) { toast.success('Product deleted'); fetchProducts(); }
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <Edit2 size={20} className="text-blue-600" />
                Edit Product
              </h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6">
              {renderProductForm(editForm, setEditForm, true, handleUpdateProduct, 'Update Product')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
