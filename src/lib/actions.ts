'use server';

import { query } from './db';
import { revalidatePath } from 'next/cache';
import { Expense, AnalyticsData, DailySpendingItem, WeeklySpendingItem, DayOfWeekSpending } from '@/types/expense';
import { createServerSupabaseClient } from './supabaseServer';

async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

export async function getExpenses(filters?: {
  startDate?: string;
  endDate?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<{ expenses: Expense[]; totalCount: number }> {
  let whereClauses: string[] = [];
  let params: any[] = [];
  let idx = 1;

  if (filters?.startDate) {
    whereClauses.push(`date >= $${idx++}`);
    params.push(filters.startDate);
  }
  if (filters?.endDate) {
    whereClauses.push(`date <= $${idx++}`);
    params.push(filters.endDate);
  }
  if (filters?.category && filters.category !== 'ALL') {
    whereClauses.push(`category = $${idx++}`);
    params.push(filters.category);
  }

  const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Count query
  const countRes = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM expenses ${whereStr}`,
    params
  );
  const totalCount = parseInt(countRes[0]?.count || '0', 10);

  // Data query
  const limit = filters?.limit || 500;
  const offset = filters?.offset || 0;
  params.push(limit);
  const limitIdx = idx++;
  params.push(offset);
  const offsetIdx = idx++;

  const rawExpenses = await query<any>(
    `SELECT 
      id,
      user_id, 
      to_char(date, 'YYYY-MM-DD') as date, 
      category, 
      sub_category, 
      amount::float as amount, 
      description, 
      created_at, 
      updated_at 
     FROM expenses 
     ${whereStr} 
     ORDER BY date DESC, created_at DESC 
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params
  );

  return {
    expenses: rawExpenses,
    totalCount,
  };
}

export async function getDashboardStats(): Promise<{
  totalSpent: number;
  transactionCount: number;
  categoryData: { name: string; value: number }[];
  monthlyData: { month: string; amount: number }[];
  weeklyData: { week: string; amount: number }[];
  dailyData: { date: string; amount: number }[];
  recentExpenses: Expense[];
  topSubCategories: { name: string; amount: number }[];
}> {
  // Total Spent and Count
  const statsRes = await query<{ total: string; count: string }>(
    `SELECT COALESCE(SUM(amount), 0)::float as total, COUNT(*)::int as count FROM expenses`
  );
  const totalSpent = Number(statsRes[0]?.total || 0);
  const transactionCount = Number(statsRes[0]?.count || 0);

  // By Category
  const catRes = await query<{ category: string; sum: string }>(
    `SELECT category, SUM(amount)::float as sum FROM expenses GROUP BY category ORDER BY sum DESC`
  );
  const categoryData = catRes.map((c) => ({
    name: c.category,
    value: Number(c.sum),
  }));

  // By Month
  const monthRes = await query<{ month_str: string; sum: string }>(
    `SELECT to_char(date, 'Mon YYYY') as month_str, date_trunc('month', date) as m_date, SUM(amount)::float as sum 
     FROM expenses 
     GROUP BY month_str, m_date 
     ORDER BY m_date ASC`
  );
  const monthlyData = monthRes.map((m) => ({
    month: m.month_str,
    amount: Number(m.sum),
  }));

  // By Week (all available weeks)
  const weekRes = await query<{ week_label: string; w_date: string; sum: string }>(
    `SELECT 
      to_char(date_trunc('week', date), 'Mon DD') || ' - ' || to_char(date_trunc('week', date) + interval '6 days', 'Mon DD') as week_label,
      date_trunc('week', date) as w_date, 
      SUM(amount)::float as sum 
     FROM expenses 
     GROUP BY week_label, w_date 
     ORDER BY w_date ASC`
  );
  const weeklyData = weekRes.map((w) => ({
    week: w.week_label,
    amount: Number(w.sum),
  }));

  // By Day (last 14 days with activity)
  const dayRes = await query<{ day_label: string; d_date: string; sum: string }>(
    `SELECT 
      to_char(date, 'Mon DD') as day_label,
      date as d_date,
      SUM(amount)::float as sum 
     FROM expenses 
     GROUP BY day_label, d_date 
     ORDER BY d_date DESC 
     LIMIT 14`
  );
  const dailyData = dayRes.reverse().map((d) => ({
    date: d.day_label,
    amount: Number(d.sum),
  }));

  // Top sub-categories
  const subRes = await query<{ sub_category: string; sum: string }>(
    `SELECT COALESCE(sub_category, 'General') as sub_category, SUM(amount)::float as sum 
     FROM expenses 
     GROUP BY sub_category 
     ORDER BY sum DESC 
     LIMIT 5`
  );
  const topSubCategories = subRes.map((s) => ({
    name: s.sub_category,
    amount: Number(s.sum),
  }));

  // Recent 8 expenses
  const recentExpenses = await query<any>(
    `SELECT 
      id,
      user_id, 
      to_char(date, 'YYYY-MM-DD') as date, 
      category, 
      sub_category, 
      amount::float as amount, 
      description, 
      created_at, 
      updated_at 
     FROM expenses 
     ORDER BY date DESC, created_at DESC 
     LIMIT 8`
  );

  return {
    totalSpent,
    transactionCount,
    categoryData,
    monthlyData,
    weeklyData,
    dailyData,
    recentExpenses,
    topSubCategories,
  };
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const rawRows = await query<any>(
    `SELECT 
      id,
      user_id, 
      to_char(date, 'YYYY-MM-DD') as date, 
      to_char(date, 'FMDay') as day_name,
      EXTRACT(ISODOW FROM date)::int as day_index,
      category, 
      sub_category, 
      amount::float as amount, 
      description, 
      created_at, 
      updated_at 
     FROM expenses 
     ORDER BY date DESC, created_at DESC`
  );

  if (!rawRows || rawRows.length === 0) {
    return {
      metrics: {
        totalSpent: 0,
        totalTransactions: 0,
        averageDailySpend: 0,
        averageWeeklySpend: 0,
        peakDay: null,
        peakWeek: null,
        trackedDaysCount: 0,
        trackedWeeksCount: 0,
      },
      weeklyList: [],
      dailyList: [],
      dayOfWeekList: [],
    };
  }

  // 1. Group by Daily Spending
  const dailyMap = new Map<string, DailySpendingItem>();
  const weekdayTotals: Record<number, { name: string; total: number; dates: Set<string>; count: number }> = {
    1: { name: 'Mon', total: 0, dates: new Set(), count: 0 },
    2: { name: 'Tue', total: 0, dates: new Set(), count: 0 },
    3: { name: 'Wed', total: 0, dates: new Set(), count: 0 },
    4: { name: 'Thu', total: 0, dates: new Set(), count: 0 },
    5: { name: 'Fri', total: 0, dates: new Set(), count: 0 },
    6: { name: 'Sat', total: 0, dates: new Set(), count: 0 },
    7: { name: 'Sun', total: 0, dates: new Set(), count: 0 },
  };

  let totalSpent = 0;

  for (const row of rawRows) {
    const amt = Number(row.amount);
    totalSpent += amt;

    const dateKey = row.date;
    const dayOfWeek = (row.day_name || '').trim();
    const dayIndex = Number(row.day_index) || 1;

    // Track weekday
    if (weekdayTotals[dayIndex]) {
      weekdayTotals[dayIndex].total += amt;
      weekdayTotals[dayIndex].dates.add(dateKey);
      weekdayTotals[dayIndex].count += 1;
    }

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        dayOfWeek,
        totalAmount: 0,
        transactionCount: 0,
        categoryBreakdown: [],
        expenses: [],
      });
    }

    const dayItem = dailyMap.get(dateKey)!;
    dayItem.totalAmount += amt;
    dayItem.transactionCount += 1;
    dayItem.expenses!.push({
      id: row.id,
      user_id: row.user_id,
      date: row.date,
      category: row.category,
      sub_category: row.sub_category,
      amount: amt,
      description: row.description,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  }

  // Finalize daily category breakdowns
  const dailyList: DailySpendingItem[] = [];
  for (const day of dailyMap.values()) {
    const catMap: Record<string, number> = {};
    for (const exp of day.expenses!) {
      catMap[exp.category] = (catMap[exp.category] || 0) + exp.amount;
    }
    day.categoryBreakdown = Object.entries(catMap)
      .map(([category, amount]) => ({ category, amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount);
    day.totalAmount = Number(day.totalAmount.toFixed(2));
    dailyList.push(day);
  }

  // Sort dailyList descending by date
  dailyList.sort((a, b) => (b.date > a.date ? 1 : -1));

  // 2. Group into Weekly Spending
  const weeklyMap = new Map<string, {
    startDate: string;
    endDate: string;
    weekNumber: number;
    year: number;
    totalAmount: number;
    transactionCount: number;
    categoryTotals: Record<string, number>;
    days: Map<string, { date: string; dayOfWeek: string; amount: number; transactionCount: number }>;
  }>();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (const day of dailyList) {
    const [y, m, d] = day.date.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    const dayOfWeekIndex = dateObj.getUTCDay(); // 0 is Sun, 1 is Mon...
    const distToMon = (dayOfWeekIndex + 6) % 7;

    const monDate = new Date(dateObj);
    monDate.setUTCDate(dateObj.getUTCDate() - distToMon);

    const sunDate = new Date(monDate);
    sunDate.setUTCDate(monDate.getUTCDate() + 6);

    const monStr = monDate.toISOString().split('T')[0];
    const sunStr = sunDate.toISOString().split('T')[0];
    const weekKey = `${monStr}_${sunStr}`;

    // Calculate ISO week number
    const target = new Date(monDate.valueOf());
    const dayNr = (monDate.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setUTCMonth(0, 1);
    if (target.getUTCDay() !== 4) {
      target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    const yearNumber = monDate.getUTCFullYear();

    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {
        startDate: monStr,
        endDate: sunStr,
        weekNumber,
        year: yearNumber,
        totalAmount: 0,
        transactionCount: 0,
        categoryTotals: {},
        days: new Map(),
      });
    }

    const weekItem = weeklyMap.get(weekKey)!;
    weekItem.totalAmount += day.totalAmount;
    weekItem.transactionCount += day.transactionCount;

    for (const cat of day.categoryBreakdown) {
      weekItem.categoryTotals[cat.category] = (weekItem.categoryTotals[cat.category] || 0) + cat.amount;
    }

    weekItem.days.set(day.date, {
      date: day.date,
      dayOfWeek: day.dayOfWeek,
      amount: day.totalAmount,
      transactionCount: day.transactionCount,
    });
  }

  const weeklyList: WeeklySpendingItem[] = [];
  for (const week of weeklyMap.values()) {
    const startObj = new Date(week.startDate);
    const endObj = new Date(week.endDate);
    const startFormatted = `${monthNames[startObj.getUTCMonth()]} ${startObj.getUTCDate()}`;
    const endFormatted = `${monthNames[endObj.getUTCMonth()]} ${endObj.getUTCDate()}, ${endObj.getUTCFullYear()}`;
    const weekLabel = `${startFormatted} – ${endFormatted}`;

    let topCategory = 'None';
    let maxCatAmt = -1;
    for (const [cat, amt] of Object.entries(week.categoryTotals)) {
      if (amt > maxCatAmt) {
        maxCatAmt = amt;
        topCategory = cat;
      }
    }

    const daysList = Array.from(week.days.values()).sort((a, b) => (b.date > a.date ? 1 : -1));

    weeklyList.push({
      weekLabel,
      weekNumber: week.weekNumber,
      year: week.year,
      startDate: week.startDate,
      endDate: week.endDate,
      totalAmount: Number(week.totalAmount.toFixed(2)),
      transactionCount: week.transactionCount,
      dailyAverage: Number((week.totalAmount / 7).toFixed(2)),
      topCategory,
      days: daysList,
    });
  }

  // Sort weeklyList descending by start date
  weeklyList.sort((a, b) => (b.startDate > a.startDate ? 1 : -1));

  // 3. Day of week spending distribution
  const dayOfWeekList: DayOfWeekSpending[] = [1, 2, 3, 4, 5, 6, 7].map((idx) => {
    const item = weekdayTotals[idx];
    const total = Number(item.total.toFixed(2));
    const distinctDatesCount = item.dates.size || 1;
    return {
      dayName: item.name,
      dayIndex: idx,
      totalAmount: total,
      avgAmount: Number((total / distinctDatesCount).toFixed(2)),
      transactionCount: item.count,
    };
  });

  // 4. Metrics & Peak values
  let peakDay: { date: string; amount: number } | null = null;
  let maxDaySpend = -1;
  for (const day of dailyList) {
    if (day.totalAmount > maxDaySpend) {
      maxDaySpend = day.totalAmount;
      peakDay = { date: day.date, amount: day.totalAmount };
    }
  }

  let peakWeek: { weekLabel: string; amount: number } | null = null;
  let maxWeekSpend = -1;
  for (const week of weeklyList) {
    if (week.totalAmount > maxWeekSpend) {
      maxWeekSpend = week.totalAmount;
      peakWeek = { weekLabel: week.weekLabel, amount: week.totalAmount };
    }
  }

  const trackedDaysCount = dailyList.length;
  const trackedWeeksCount = weeklyList.length;

  return {
    metrics: {
      totalSpent: Number(totalSpent.toFixed(2)),
      totalTransactions: rawRows.length,
      averageDailySpend: trackedDaysCount > 0 ? Number((totalSpent / trackedDaysCount).toFixed(2)) : 0,
      averageWeeklySpend: trackedWeeksCount > 0 ? Number((totalSpent / trackedWeeksCount).toFixed(2)) : 0,
      peakDay,
      peakWeek,
      trackedDaysCount,
      trackedWeeksCount,
    },
    weeklyList,
    dailyList,
    dayOfWeekList,
  };
}


export async function addExpense(data: {
  date: string;
  category: string;
  sub_category?: string;
  amount: number;
  description?: string;
}) {
  const userId = await getCurrentUserId();
  
  // If not logged in, fallback to the linked default owner amarasingheau@gmail.com
  const fallbackRes = await query<{ id: string }>(
    `SELECT id FROM auth.users WHERE email = 'amarasingheau@gmail.com' LIMIT 1`
  );
  const targetUserId = userId || fallbackRes[0]?.id || null;

  await query(
    `INSERT INTO expenses (user_id, date, category, sub_category, amount, description) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      targetUserId,
      data.date,
      data.category,
      data.sub_category || null,
      data.amount,
      data.description || null,
    ]
  );
  revalidatePath('/');
  revalidatePath('/expenses');
  return { success: true };
}

export async function deleteExpense(id: string) {
  await query(`DELETE FROM expenses WHERE id = $1`, [id]);
  revalidatePath('/');
  revalidatePath('/expenses');
  return { success: true };
}

export async function updateExpense(
  id: string,
  data: {
    date: string;
    category: string;
    sub_category?: string;
    amount: number;
    description?: string;
  }
) {
  await query(
    `UPDATE expenses 
     SET date = $1, category = $2, sub_category = $3, amount = $4, description = $5, updated_at = NOW() 
     WHERE id = $6`,
    [
      data.date,
      data.category,
      data.sub_category || null,
      data.amount,
      data.description || null,
      id,
    ]
  );
  revalidatePath('/');
  revalidatePath('/expenses');
  return { success: true };
}
