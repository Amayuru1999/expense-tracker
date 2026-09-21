import { Wallet, TrendingUp, Calendar, Layers } from 'lucide-react';

interface Props {
  totalSpent: number;
  transactionCount: number;
  topSubCategories: { name: string; amount: number }[];
}

export default function StatsCards({ totalSpent, transactionCount, topSubCategories }: Props) {
  const avgPerTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;
  const topSub = topSubCategories[0]?.name || 'N/A';
  const topSubAmount = topSubCategories[0]?.amount || 0;

  const stats = [
    {
      name: 'Total Expenses Recorded',
      value: `LKR ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Imported from Google Sheet + New',
      icon: Wallet,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      name: 'Total Transactions',
      value: transactionCount.toLocaleString(),
      description: 'Across 29 weekly reports',
      icon: Layers,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      name: 'Avg / Transaction',
      value: `LKR ${avgPerTransaction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Average per spending record',
      icon: TrendingUp,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      name: 'Top Spending Sub-Type',
      value: topSub,
      description: `LKR ${topSubAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} total spent`,
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.name}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-500">{item.name}</span>
              <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {item.value}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
