export interface Expense {
  id: string;
  user_id?: string | null;
  date: string;
  category: string;
  sub_category: string | null;
  amount: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseSummary {
  totalSpent: number;
  totalTransactions: number;
  categoryBreakdown: { category: string; amount: number; count: number }[];
  dailySpending: { date: string; amount: number }[];
  weeklySpending: { week: string; amount: number }[];
  monthlySpending: { month: string; amount: number }[];
}
