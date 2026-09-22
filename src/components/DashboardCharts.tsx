'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  categoryData: { name: string; value: number }[];
  monthlyData: { month: string; amount: number }[];
  weeklyData?: { week: string; amount: number }[];
  dailyData?: { date: string; amount: number }[];
}

const COLORS = [
  '#059669', // emerald
  '#2563eb', // blue
  '#0284c7', // sky
  '#d97706', // amber
  '#dc2626', // red
  '#7c3aed', // purple
];

export default function DashboardCharts({ categoryData, monthlyData, weeklyData = [], dailyData = [] }: Props) {
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly' | 'daily'>('monthly');

  const chartData =
    timeframe === 'monthly'
      ? monthlyData.map((d) => ({ label: d.month, amount: d.amount }))
      : timeframe === 'weekly'
      ? weeklyData.map((d) => ({ label: d.week, amount: d.amount }))
      : dailyData.map((d) => ({ label: d.date, amount: d.amount }));

  const timeframeTitles = {
    monthly: { title: 'Monthly Expense Trend', sub: 'Total spending trajectory grouped by month' },
    weekly: { title: 'Weekly Expense Trend', sub: 'Total spending trajectory grouped by week' },
    daily: { title: 'Daily Expense Trend', sub: 'Recent spending per day' },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
      {/* Spending Trend with Timeframe Switcher */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {timeframeTitles[timeframe].title}
              </h3>
              <Link
                href="/analytics"
                className="inline-flex items-center text-[11px] font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                title="Open detailed analytics"
              >
                Analytics <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
            <p className="text-xs text-zinc-500">{timeframeTitles[timeframe].sub}</p>
          </div>

          {/* Timeframe pill switcher */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl self-start sm:self-auto">
            {(['monthly', 'weekly', 'daily'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  timeframe === t
                    ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                dataKey="label"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                angle={timeframe === 'weekly' ? -25 : 0}
                textAnchor={timeframe === 'weekly' ? 'end' : 'middle'}
                height={timeframe === 'weekly' ? 45 : 30}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val >= 1000 ? `${val / 1000}k` : val}`}
              />
              <Tooltip
                formatter={(val: any) => [
                  `LKR ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                  'Spent',
                ]}
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="amount" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Spending by Category
          </h3>
          <p className="text-xs text-zinc-500">Distribution across Food, Transport, Water, etc.</p>
        </div>
        <div className="h-64 sm:h-72 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="h-44 sm:h-full w-full sm:w-3/5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [
                    `LKR ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                    'Total',
                  ]}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full sm:w-2/5 flex flex-row sm:flex-col flex-wrap justify-between gap-2 text-xs">
            {categoryData.map((item, idx) => {
              const total = categoryData.reduce((acc, c) => acc + c.value, 0);
              const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between gap-3 w-full min-w-[120px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
