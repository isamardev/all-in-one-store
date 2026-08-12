'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, Phone, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ProductInfo {
  id: number;
  name: string;
  image: string | null;
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  Product?: ProductInfo;
}

interface Order {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  status: string;
  date: string;
  OrderItems?: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200' },
];

function getStatusStyle(status: string) {
  const normalized = status === 'confirmed' ? 'pending' : status;
  return STATUS_OPTIONS.find(s => s.value === normalized)?.color || 'bg-gray-50 text-gray-700 border-gray-200';
}

function getStatusLabel(status: string) {
  const normalized = status === 'confirmed' ? 'pending' : status;
  return STATUS_OPTIONS.find(s => s.value === normalized)?.label || status;
}

function normalizeStatus(status: string) {
  return status === 'confirmed' ? 'pending' : status;
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status }),
    });

    if (res.ok) {
      toast.success('Order status updated');
      fetchOrders();
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to update status');
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => normalizeStatus(o.status) === 'pending').length,
    processing: orders.filter(o => normalizeStatus(o.status) === 'processing').length,
    delivered: orders.filter(o => normalizeStatus(o.status) === 'delivered').length,
    cancelled: orders.filter(o => normalizeStatus(o.status) === 'cancelled').length,
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => normalizeStatus(o.status) === filter);

  const statCards = [
    { label: 'Total Orders', value: stats.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Processing', value: stats.processing, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon size={22} className={card.color} />
              </div>
              <span className="text-3xl font-black text-gray-900">{card.value}</span>
            </div>
            <p className="text-sm font-bold text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-gray-800">Manage Orders</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: `All (${stats.total})` },
              { key: 'pending', label: `Pending (${stats.pending})` },
              { key: 'processing', label: `Processing (${stats.processing})` },
              { key: 'delivered', label: `Delivered (${stats.delivered})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === f.key ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="p-12 text-center text-gray-400">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="p-12 text-center text-gray-400">No orders found</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOrders.map(order => {
              const isExpanded = expandedId === order.id;
              const items = order.OrderItems || [];

              return (
                <div key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-100 rounded-xl p-3 font-black text-gray-600 text-sm">
                          #{order.id}
                        </div>
                        <div>
                          <p className="font-black text-gray-900">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{format(new Date(order.date), 'dd MMM yyyy, hh:mm a')}</p>
                          <p className="text-xs text-gray-400 mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-xl font-black text-gray-900">Rs. {order.total.toFixed(0)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <select
                          value={normalizeStatus(order.status)}
                          onChange={e => {
                            e.stopPropagation();
                            updateStatus(order.id, e.target.value);
                          }}
                          onClick={e => e.stopPropagation()}
                          className="text-sm font-bold border border-gray-200 rounded-xl px-3 py-2 bg-white text-black focus:border-blue-500 outline-none"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User size={16} className="text-blue-600" />
                            <span className="font-bold">{order.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone size={16} className="text-blue-600" />
                            <a href={`tel:${order.phone}`} className="font-bold hover:text-blue-600">{order.phone}</a>
                          </div>
                          <div className="flex items-start gap-2 text-gray-600 md:col-span-1">
                            <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{order.address}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Order Items</p>
                          <div className="space-y-2">
                            {items.map(item => (
                              <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
                                <div className="flex items-center gap-3">
                                  {item.Product?.image ? (
                                    <img src={item.Product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm">
                                      {item.Product?.name?.charAt(0) || '?'}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-gray-800 text-sm">{item.Product?.name || `Product #${item.productId}`}</p>
                                    <p className="text-xs text-gray-400">Qty: {item.quantity} × Rs. {item.price.toFixed(0)}</p>
                                  </div>
                                </div>
                                <span className="font-black text-gray-900">Rs. {(item.price * item.quantity).toFixed(0)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {normalizeStatus(order.status) === 'cancelled' && (
                          <div className="flex items-center gap-2 text-red-600 text-sm font-bold">
                            <XCircle size={16} /> This order was cancelled
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
