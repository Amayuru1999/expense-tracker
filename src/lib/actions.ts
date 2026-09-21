'use server';

import { query } from './db';
import { revalidatePath } from 'next/cache';
import { Expense } from '@/types/expense';

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
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;
  params.push(limit);
  const limitIdx = idx++;
  params.push(offset);
  const offsetIdx = idx++;

  const rawExpenses = await query<any>(
    `SELECT 
      id, 
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
    recentExpenses,
    topSubCategories,
  };
}

export async function addExpense(data: {
  date: string;
  category: string;
  sub_category?: string;
  amount: number;
  description?: string;
}) {
  await query(
    `INSERT INTO expenses (date, category, sub_category, amount, description) 
     VALUES ($1, $2, $3, $4, $5)`,
    [
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
