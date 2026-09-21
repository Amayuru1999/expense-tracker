'use client';

import { useState } from 'react';
import { Expense } from '@/types/expense';
import { deleteExpense } from '@/lib/actions';
import { Trash2, Calendar, Tag, Loader2, Search } from 'lucide-react';

interface Props {
  initialExpenses: Expense[];
  totalCount: number;
}

export default function ExpenseTable({ initialExpenses, totalCount }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchDate, setSearchDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
    if (searchDate && !e.date.startsWith(searchDate)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchCat = e.category.toLowerCase().includes(term);
      const matchSub = (e.sub_category || '').toLowerCase().includes(term);
      const matchDesc = (e.description || '').toLowerCase().includes(term);
      if (!matchCat && !matchSub && !matchDesc) return false;
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    setDeletingId(id);
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const categories = ['ALL', 'Food', 'Transport', 'Water', 'Utilities', 'Other'];

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Food':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      case 'Transport':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
      case 'Water':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800';
      default:
        return 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      {/* Table Filters */}
      <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Expense Records
            </h3>
            <p className="text-xs text-zinc-500">
              Showing {filteredExpenses.length} of {totalCount} total entries
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 pt-2">
          {/* Search box */}
          <div className="relative flex-1 min-w-[160px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search memo or sub-type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            {searchDate && (
              <button
                onClick={() => setSearchDate('')}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card View (visible on small screens < md) */}
      <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No expense records found matching criteria.
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div key={expense.id} className="p-4 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${getCategoryBadgeClass(
                      expense.category
                    )}`}
                  >
                    {expense.category}
                  </span>
                  {expense.sub_category && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      • {expense.sub_category}
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-400">
                  {expense.date}
                  {expense.description && (
                    <span className="text-zinc-600 dark:text-zinc-300"> — {expense.description}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-bold text-sm text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  Rs {Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  className="text-zinc-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {deletingId === expense.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (hidden on small screens < md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400">
            <tr>
              <th className="py-3.5 px-6">Date</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Sub-Category</th>
              <th className="py-3.5 px-6">Description</th>
              <th className="py-3.5 px-6 text-right">Amount (LKR)</th>
              <th className="py-3.5 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-zinc-500">
                  No expense records found.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-6 font-medium whitespace-nowrap">
                    {expense.date}
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${getCategoryBadgeClass(
                        expense.category
                      )}`}
                    >
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-zinc-500 dark:text-zinc-400 text-xs">
                    {expense.sub_category || '—'}
                  </td>
                  <td className="py-3.5 px-6 text-xs text-zinc-600 dark:text-zinc-300">
                    {expense.description || '—'}
                  </td>
                  <td className="py-3.5 px-6 text-right font-semibold whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                    LKR {Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <button
                      onClick={() => handleDelete(expense.id)}
                      disabled={deletingId === expense.id}
                      className="text-zinc-400 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="Delete expense"
                    >
                      {deletingId === expense.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
