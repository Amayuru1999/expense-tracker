import { getDashboardStats } from '@/lib/actions';
import StatsCards from '@/components/StatsCards';
import DashboardCharts from '@/components/DashboardCharts';
import ExpenseForm from '@/components/ExpenseForm';
import Link from 'next/link';
import { ArrowRight, ReceiptText } from 'lucide-react';

export const revalidate = 0; // Dynamic server page

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Financial Overview
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Historical expenses from March 9, 2026 to present, synced to Supabase database.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/expenses"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <ReceiptText className="h-4 w-4" />
            <span>View All Records</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalSpent={stats.totalSpent}
        transactionCount={stats.transactionCount}
        topSubCategories={stats.topSubCategories}
      />

      {/* Charts Section */}
      <DashboardCharts
        categoryData={stats.categoryData}
        monthlyData={stats.monthlyData}
        weeklyData={stats.weeklyData}
        dailyData={stats.dailyData}
      />

      {/* Bottom Grid: Form + Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ExpenseForm />
        </div>

        {/* Recent Expenses List */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Recent Transactions
              </h3>
              <p className="text-xs text-zinc-500">Latest recorded expenses</p>
            </div>
            <Link
              href="/expenses"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-500 inline-flex items-center gap-1"
            >
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {stats.recentExpenses.map((expense) => (
              <div key={expense.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {expense.category}
                    </span>
                    {expense.sub_category && (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {expense.sub_category}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400">{expense.date}</span>
                </div>
                <div className="text-right font-semibold text-zinc-900 dark:text-zinc-100">
                  LKR {Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
