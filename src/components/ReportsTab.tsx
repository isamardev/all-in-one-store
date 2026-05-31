'use client';

import { useState, useEffect } from 'react';
import { FileText, TrendingUp, TrendingDown, DollarSign, Trash2, Edit2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ReportData {
  summary: {
    totalSales: number;
    totalProfit: number;
    totalExpenses: number;
    netProfit: number;
  };
  sales: any[];
  expenses: any[];
}

export default function ReportsTab() {
  const [type, setType] = useState('day');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [report, setReport] = useState<ReportData | null>(null);
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  
  // Sale Edit State
  const [editSalePrice, setEditSalePrice] = useState('');
  
  // Expense Edit State
  const [editExpenseDesc, setEditExpenseDesc] = useState('');
  const [editExpenseAmount, setEditExpenseAmount] = useState('');

  useEffect(() => {
    fetchReport();

    // Listen for updates
    window.addEventListener('sale-updated', fetchReport);
    return () => window.removeEventListener('sale-updated', fetchReport);
  }, [type, date]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/reports?type=${type}&date=${date}&t=${Date.now()}`);
      const data = await res.json();
      if (data && data.summary) {
        setReport(data);
      } else {
        setReport(null);
      }
    } catch (error) {
      setReport(null);
    }
  };

  const handleSaleEdit = (s: any) => {
    setEditingSaleId(s.id);
    setEditSalePrice(s.salePrice.toString());
  };

  const saveSaleEdit = async (s: any) => {
    const newSalePrice = parseFloat(editSalePrice);
    if (isNaN(newSalePrice)) return;
    
    const profit = newSalePrice - s.costPrice;
    
    const res = await fetch('/api/sales', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, salePrice: newSalePrice, profit }),
    });

    if (res.ok) {
      toast.success('Sale updated!');
      setEditingSaleId(null);
      fetchReport();
      window.dispatchEvent(new Event('sale-updated'));
    }
  };

  const handleExpenseEdit = (e: any) => {
    setEditingExpenseId(e.id);
    setEditExpenseDesc(e.description);
    setEditExpenseAmount(e.amount.toString());
  };

  const saveExpenseEdit = async (id: number) => {
    const amount = parseFloat(editExpenseAmount);
    if (isNaN(amount)) return;

    const res = await fetch('/api/expenses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, description: editExpenseDesc, amount }),
    });

    if (res.ok) {
      toast.success('Expense updated!');
      setEditingExpenseId(null);
      fetchReport();
      window.dispatchEvent(new Event('sale-updated'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Report Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 border text-black"
          >
            <option value="day">Daily</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Date</label>
          <input
            type={type === 'day' ? 'date' : type === 'month' ? 'month' : 'number'}
            value={type === 'year' ? date.substring(0, 4) : date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 border text-black"
          />
        </div>
        <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-600 ml-auto">
          <FileText size={24} /> Financial Report
        </h2>
      </div>

      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
            <p className="text-blue-600 text-sm font-semibold uppercase">Total Sales</p>
            <p className="text-2xl font-bold text-blue-900 flex items-center gap-1">
              <DollarSign size={20} /> {(report?.summary?.totalSales || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
            <p className="text-green-600 text-sm font-semibold uppercase">Gross Profit</p>
            <p className="text-2xl font-bold text-green-900 flex items-center gap-1">
              <TrendingUp size={20} /> {(report?.summary?.totalProfit || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm">
            <p className="text-red-600 text-sm font-semibold uppercase">Expenses</p>
            <p className="text-2xl font-bold text-red-900 flex items-center gap-1">
              <TrendingDown size={20} /> {(report?.summary?.totalExpenses || 0).toFixed(2)}
            </p>
          </div>
          <div className={`p-6 rounded-xl border shadow-sm ${(report?.summary?.netProfit || 0) >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
            <p className={`${(report?.summary?.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-orange-600'} text-sm font-semibold uppercase`}>Net Profit</p>
            <p className={`text-2xl font-bold flex items-center gap-1 ${(report?.summary?.netProfit || 0) >= 0 ? 'text-emerald-900' : 'text-orange-900'}`}>
              <DollarSign size={20} /> {(report?.summary?.netProfit || 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {report && (
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Sales List</h3>
            <div className="max-h-[400px] overflow-y-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-black uppercase border-b border-gray-200">
                    <th className="py-2">Date</th>
                    <th className="py-2">Item</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Profit</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.isArray(report.sales) && report.sales.map((s, i) => (
                    <tr key={i} className="text-sm text-black">
                      <td className="py-2 text-gray-900">{format(new Date(s.date), 'dd MMM HH:mm')}</td>
                      <td className="py-2 font-black text-black">{s.Product?.name || 'N/A'}</td>
                      <td className="py-2 font-bold text-black">
                        {editingSaleId === s.id ? (
                          <input
                            type="number"
                            value={editSalePrice}
                            onChange={(e) => setEditSalePrice(e.target.value)}
                            className="w-20 p-1 border rounded text-black"
                            autoFocus
                          />
                        ) : (
                          s.salePrice.toFixed(2)
                        )}
                      </td>
                      <td className="py-2 text-green-700 font-bold">
                        {editingSaleId === s.id ? (
                          <span className="opacity-50">+{ (parseFloat(editSalePrice) - s.costPrice || s.profit).toFixed(2) }</span>
                        ) : (
                          `+${s.profit.toFixed(2)}`
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex gap-2 justify-end">
                          {editingSaleId === s.id ? (
                            <>
                              <button onClick={() => saveSaleEdit(s)} className="text-green-600 hover:text-green-800"><Check size={14}/></button>
                              <button onClick={() => setEditingSaleId(null)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleSaleEdit(s)} className="text-blue-400 hover:text-blue-600"><Edit2 size={14}/></button>
                              <button
                                onClick={async () => {
                                  if (confirm('Delete this sale?')) {
                                    const res = await fetch(`/api/sales?id=${s.id}`, { method: 'DELETE' });
                                    if (res.ok) {
                                      toast.success('Sale deleted');
                                      fetchReport();
                                      window.dispatchEvent(new Event('sale-updated'));
                                    }
                                  }
                                }}
                                className="text-red-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Expense List</h3>
            <div className="max-h-[400px] overflow-y-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-black uppercase border-b border-gray-200">
                    <th className="py-2">Date</th>
                    <th className="py-2">Description</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.isArray(report.expenses) && report.expenses.map((e, i) => (
                    <tr key={i} className="text-sm text-black">
                      <td className="py-2 text-gray-900">{format(new Date(e.date), 'dd MMM')}</td>
                      <td className="py-2 font-bold text-black">
                        {editingExpenseId === e.id ? (
                          <input
                            type="text"
                            value={editExpenseDesc}
                            onChange={(e) => setEditExpenseDesc(e.target.value)}
                            className="w-full p-1 border rounded text-black"
                          />
                        ) : (
                          e.description
                        )}
                      </td>
                      <td className="py-2 text-red-700 font-black">
                        {editingExpenseId === e.id ? (
                          <input
                            type="number"
                            value={editExpenseAmount}
                            onChange={(e) => setEditExpenseAmount(e.target.value)}
                            className="w-20 p-1 border rounded text-black"
                          />
                        ) : (
                          e.amount.toFixed(2)
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex gap-2 justify-end">
                          {editingExpenseId === e.id ? (
                            <>
                              <button onClick={() => saveExpenseEdit(e.id)} className="text-green-600 hover:text-green-800"><Check size={14}/></button>
                              <button onClick={() => setEditingExpenseId(null)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleExpenseEdit(e)} className="text-blue-400 hover:text-blue-600"><Edit2 size={14}/></button>
                              <button
                                onClick={async () => {
                                  if (confirm('Delete this expense?')) {
                                    const res = await fetch(`/api/expenses?id=${e.id}`, { method: 'DELETE' });
                                    if (res.ok) {
                                      toast.success('Expense deleted');
                                      fetchReport();
                                      window.dispatchEvent(new Event('sale-updated'));
                                    }
                                  }
                                }}
                                className="text-red-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
