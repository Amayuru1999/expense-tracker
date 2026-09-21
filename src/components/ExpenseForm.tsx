'use client';

import { useState } from 'react';
import { addExpense } from '@/lib/actions';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function ExpenseForm() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [category, setCategory] = useState('Food');
  const [subCategory, setSubCategory] = useState('Lunch');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const subCategoriesByCategory: Record<string, string[]> = {
    Food: ['Morning', 'Lunch', 'Dinner', 'Snack', 'Groceries'],
    Transport: ['Morning', 'Evening', 'Fuel', 'Bus', 'Train', 'Cab'],
    Water: ['Bottle', 'Can', 'Filter'],
    Utilities: ['Electricity', 'Internet', 'Mobile', 'Gas'],
    Other: ['General', 'Personal Care', 'Medical'],
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const available = subCategoriesByCategory[newCat] || [];
    setSubCategory(available[0] || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    try {
      await addExpense({
        date,
        category,
        sub_category: subCategory || undefined,
        amount: parseFloat(amount),
        description: description || undefined,
      });

      setAmount('');
      setDescription('');
      setSuccessMsg('Expense added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert('Failed to add expense: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="add-new" className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 scroll-mt-20">
      <div className="flex items-center gap-2 mb-4">
        <PlusCircle className="h-5 w-5 text-emerald-600" />
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Add New Expense
        </h3>
      </div>

      {successMsg && (
        <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Amount (LKR)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 350.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {Object.keys(subCategoriesByCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Sub Category
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {(subCategoriesByCategory[category] || []).map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Description (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Lunch with friends"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs sm:text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Expense</span>
          )}
        </button>
      </form>
    </div>
  );
}
