'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Trash2, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
}

export default function ExpenseTab() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleEdit = (e: Expense) => {
    setEditingExpense(e);
    setDescription(e.description);
    setAmount(e.amount.toString());
  };

  const cancelEdit = () => {
    setEditingExpense(null);
    setDescription('');
    setAmount('');
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      if (Array.isArray(data)) {
        setExpenses(data);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      setExpenses([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const url = '/api/expenses';
    const method = editingExpense ? 'PUT' : 'POST';
    const body = JSON.stringify({ 
      id: editingExpense?.id,
      description, 
      amount: parseFloat(amount) 
    });

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (res.ok) {
      window.dispatchEvent(new Event('sale-updated'));
      toast.success(editingExpense ? 'Expense updated!' : 'Expense recorded!');
      setDescription('');
      setAmount('');
      setEditingExpense(null);
      fetchExpenses();
    } else {
      const err = await res.json();
      toast.error('Error: ' + (err.error || 'Failed to save expense'));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-md h-fit">
        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${editingExpense ? 'text-blue-600' : 'text-red-600'}`}>
          {editingExpense ? <Edit2 size={24} /> : <CreditCard size={24} />}
          {editingExpense ? 'Edit Expense' : 'Add Expense'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 bg-gray-50 p-2 border text-black"
              placeholder="e.g., Electricity Bill"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 bg-gray-50 p-2 border text-black"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className={`flex-1 text-white py-2 px-4 rounded-md transition-colors font-semibold ${editingExpense ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {editingExpense ? 'Update Expense' : 'Save Expense'}
            </button>
            {editingExpense && (
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
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Expense History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Description</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(expenses) && expenses.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{e.description}</td>
                  <td className="px-4 py-3 text-sm text-red-600 font-bold">Rs. {e.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(e)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this expense?')) {
                            const res = await fetch(`/api/expenses?id=${e.id}`, { method: 'DELETE' });
                            if (res.ok) {
                              toast.success('Expense deleted');
                              fetchExpenses();
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
