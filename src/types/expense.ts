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

export interface DailySpendingItem {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // e.g. "Monday"
  totalAmount: number;
  transactionCount: number;
  categoryBreakdown: { category: string; amount: number }[];
  expenses?: Expense[];
}

export interface WeeklySpendingItem {
  weekLabel: string; // e.g. "Sep 15 – Sep 21, 2026"
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  transactionCount: number;
  dailyAverage: number;
  topCategory: string;
  days: {
    date: string;
    dayOfWeek: string;
    amount: number;
    transactionCount: number;
  }[];
}

export interface DayOfWeekSpending {
  dayName: string; // "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
  dayIndex: number; // 1 to 7
  totalAmount: number;
  avgAmount: number;
  transactionCount: number;
}

export interface AnalyticsData {
  metrics: {
    totalSpent: number;
    totalTransactions: number;
    averageDailySpend: number;
    averageWeeklySpend: number;
    peakDay: { date: string; amount: number } | null;
    peakWeek: { weekLabel: string; amount: number } | null;
    trackedDaysCount: number;
    trackedWeeksCount: number;
  };
  weeklyList: WeeklySpendingItem[];
  dailyList: DailySpendingItem[];
  dayOfWeekList: DayOfWeekSpending[];
}

