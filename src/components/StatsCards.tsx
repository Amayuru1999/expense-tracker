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
      name: 'Total Expenditure',
      value: `LKR ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Up to Sep 21, 2026',
      icon: Wallet,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      name: 'Total Entries',
      value: transactionCount.toLocaleString(),
      description: 'All recorded sessions',
      icon: Layers,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      name: 'Avg / Record',
      value: `LKR ${avgPerTransaction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: 'Average per spending',
      icon: TrendingUp,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      name: 'Top Expense Sub-Type',
      value: topSub,
      description: `LKR ${topSubAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.name}
            className="rounded-3xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-medium text-zinc-500 line-clamp-1">{item.name}</span>
              <div className={`p-1.5 sm:p-2 rounded-xl ${item.bg} ${item.color}`}>
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
                {item.value}
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
