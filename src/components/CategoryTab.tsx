'use client';

import { useState, useEffect } from 'react';
import { Tag, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
}

export default function CategoryTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchCategories();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      toast.success('Category created!');
      setName('');
      fetchCategories();
      window.dispatchEvent(new Event('sale-updated'));
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to create category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const res = await fetch(`/api/categories?id=${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      toast.success('Category deleted');
      fetchCategories();
      window.dispatchEvent(new Event('sale-updated'));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 h-fit">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-blue-600">
          <div className="bg-blue-100 p-2 rounded-xl">
            <Tag size={24} />
          </div>
          Create Category
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all text-black font-bold shadow-inner"
              placeholder="e.g. Mobile, Accessories"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add Category
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
        <h2 className="text-2xl font-black mb-6 text-gray-800">All Categories</h2>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
              <span className="font-bold text-gray-700">{cat.name}</span>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-center text-gray-400 py-8 font-medium italic">No categories created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
