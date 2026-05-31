'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, History } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const res = await fetch(`/api/reports?type=day&t=${Date.now()}`);
      const json = await res.json();
      setData(json.dashboard);
    };
    fetchDashboard();

    // Listen for updates
    window.addEventListener('sale-updated', fetchDashboard);
    return () => window.removeEventListener('sale-updated', fetchDashboard);
  }, []);

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Today's Sale Card - Compact */}
      <div className="bg-white p-1 rounded-[1.5rem] shadow-lg shadow-blue-100/50 border border-blue-50 group hover:scale-[1.02] transition-transform duration-300">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-[1.3rem] text-white relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px]">Today's Sale</p>
              <p className="text-2xl font-black tracking-tighter">Rs. {(data?.todayTotal || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Calendar size={18} className="text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <p className="text-[10px] text-blue-100 font-bold uppercase">Live Updates</p>
          </div>
        </div>
      </div>

      {/* Comparison Card - Compact */}
      <div className="bg-white p-1 rounded-[1.5rem] shadow-lg shadow-purple-100/50 border border-purple-50 group hover:scale-[1.02] transition-transform duration-300">
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-[1.3rem] text-white relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-purple-100 font-bold uppercase tracking-widest text-[10px]">Last Month Same Day</p>
              <p className="text-2xl font-black tracking-tighter">Rs. {(data?.lastMonthDayTotal || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <History size={18} className="text-white" />
            </div>
          </div>
          <div className="relative z-10">
            {data?.todayTotal > data?.lastMonthDayTotal ? (
              <p className="text-[10px] text-green-300 font-bold uppercase flex items-center gap-1">
                ▲ Performance Up
              </p>
            ) : (
              <p className="text-[10px] text-purple-200 font-bold uppercase flex items-center gap-1">
                ▼ Stable Growth
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
