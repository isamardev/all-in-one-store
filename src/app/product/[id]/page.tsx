'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, ShoppingCart, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import { useCart } from '@/lib/cart';

interface Product {
  id: number;
  name: string;
  description?: string | null;
  salePrice: number;
  compareAtPrice?: number;
  stock: number;
  image: string | null;
  images?: string | null;
  category: string;
  sku?: string | null;
}

function getProductImages(product: Product): string[] {
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { /* fall through */ }
  }
  return product.image ? [product.image] : [];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setProduct(null);
        } else {
          setProduct(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-20 flex-1 w-full text-center text-gray-400">Loading...</main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-20 flex-1 w-full text-center">
          <p className="text-gray-400 text-lg mb-6">Product not found</p>
          <Link href="/" className="text-blue-600 font-bold hover:underline">← Back to Store</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const images = getProductImages(product);
  const hasDiscount = (product.compareAtPrice || 0) > product.salePrice;
  const discount = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.salePrice) / product.compareAtPrice!) * 100)
    : 0;
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error('Out of stock!');
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.salePrice,
        image: images[0] || product.image,
        stock: product.stock,
      });
    }
    toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Store
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm relative">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200 text-8xl font-black">
                  {product.name.charAt(0)}
                </div>
              )}
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-black px-3 py-1.5 rounded-xl">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === i ? 'border-blue-600 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={14} className="text-blue-600" />
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wide">{product.category}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{product.name}</h1>

            {product.sku && (
              <p className="text-sm text-gray-400 font-mono mb-4">SKU: {product.sku}</p>
            )}

            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-black text-gray-900">Rs. {product.salePrice.toFixed(0)}</span>
              {hasDiscount && (
                <span className="text-xl text-gray-400 line-through mb-1">Rs. {product.compareAtPrice!.toFixed(0)}</span>
              )}
            </div>

            <div className="mb-6">
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 text-green-600 font-bold text-sm bg-green-50 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-red-600 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {product.description && (
              <div className="mb-8">
                <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="mt-auto pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={!inStock}
                    className="p-3 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-5 font-black text-lg text-gray-800 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={!inStock}
                    className="p-3 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-black py-3.5 px-6 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
