import { useState, useEffect } from 'react';
import { AlertTriangle, Package, Search, ShoppingCart } from 'lucide-react';
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

export default function OutOfStockTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutOfStock();
    window.addEventListener('sale-updated', fetchOutOfStock);
    return () => window.removeEventListener('sale-updated', fetchOutOfStock);
  }, []);

  const fetchOutOfStock = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter products with stock <= 0
        const outOfStock = data.filter((p: Product) => p.stock <= 0);
        setProducts(outOfStock);
      }
    } catch (error) {
      console.error('Failed to fetch out of stock products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-4 rounded-3xl shadow-lg shadow-red-100/50">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Out of Stock</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Items needing restock</p>
            </div>
          </div>
          
          <div className="bg-red-50 px-6 py-3 rounded-2xl border border-red-100">
            <span className="text-red-600 font-black text-2xl">{products.length}</span>
            <span className="text-red-400 text-xs font-bold uppercase ml-2 tracking-tighter">Items Missing</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Checking Inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
            <div className="bg-green-100 p-6 rounded-full inline-block mb-6">
              <Package className="text-green-600" size={48} />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Inventory is Healthy!</h3>
            <p className="text-gray-400 font-medium">All products currently have stock available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2rem] border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Details</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Code</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-red-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-red-100 group-hover:text-red-500 transition-colors">
                          <Package size={20} />
                        </div>
                        <span className="font-black text-gray-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-mono text-sm text-gray-500 font-bold">
                      {p.code}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                        <ShoppingCart size={12} /> Out of Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
