import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-blue-200 font-bold uppercase tracking-widest text-sm mb-4">Welcome to</p>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
            All In One Store
          </h1>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            Best quality products at great prices. Browse categories, add to cart, and order with ease.
          </p>
          <Link
            href="#products"
            className="inline-block bg-white text-blue-600 font-black px-8 py-4 rounded-2xl shadow-xl hover:scale-105 transition-transform"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
