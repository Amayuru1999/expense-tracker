'use client';

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

interface Props {
  categoryData: { name: string; value: number }[];
  monthlyData: { month: string; amount: number }[];
}

const COLORS = [
  '#059669', // emerald
  '#2563eb', // blue
  '#0284c7', // sky
  '#d97706', // amber
  '#dc2626', // red
  '#7c3aed', // purple
];

export default function DashboardCharts({ categoryData, monthlyData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
      {/* Monthly Trend */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Monthly Expense Trend
          </h3>
          <p className="text-xs text-zinc-500">Total spending trajectory grouped by month</p>
        </div>
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
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
