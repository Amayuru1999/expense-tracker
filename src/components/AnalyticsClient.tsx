'use client';

import { useState, useMemo } from 'react';
import {
  AnalyticsData,
  WeeklySpendingItem,
  DailySpendingItem,
  Expense,
} from '@/types/expense';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  CalendarDays,
  Award,
  ChevronDown,
  ChevronUp,
  Search,
  Receipt,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Props {
  data: AnalyticsData;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  Transport: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
  Water: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800',
  Utilities: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  Other: 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
};

function formatLKR(amount: number) {
  return `LKR ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AnalyticsClient({ data }: Props) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'daily'>('weekly');
  const [expandedWeekKey, setExpandedWeekKey] = useState<string | null>(null);
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  const { metrics, weeklyList, dailyList, dayOfWeekList } = data;

  // Toggle week accordion
  const toggleWeek = (weekLabel: string) => {
    setExpandedWeekKey((prev) => (prev === weekLabel ? null : weekLabel));
  };

  // Toggle day accordion
  const toggleDay = (date: string) => {
    setExpandedDayKey((prev) => (prev === date ? null : date));
  };

  // Filtered daily list
  const filteredDailyList = useMemo(() => {
    return dailyList.filter((day) => {
      if (selectedDateFilter && day.date !== selectedDateFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesDate = day.date.includes(term);
        const matchesDay = day.dayOfWeek.toLowerCase().includes(term);
        const matchesCat = day.categoryBreakdown.some((c) =>
          c.category.toLowerCase().includes(term)
        );
        const matchesDesc = day.expenses?.some(
          (e) =>
            (e.description || '').toLowerCase().includes(term) ||
            (e.sub_category || '').toLowerCase().includes(term)
        );
        if (!matchesDate && !matchesDay && !matchesCat && !matchesDesc) return false;
      }
      return true;
    });
  }, [dailyList, searchTerm, selectedDateFilter]);

  // Filtered weekly list
  const filteredWeeklyList = useMemo(() => {
    if (!searchTerm) return weeklyList;
    const term = searchTerm.toLowerCase();
    return weeklyList.filter(
      (week) =>
        week.weekLabel.toLowerCase().includes(term) ||
        week.topCategory.toLowerCase().includes(term) ||
        `week ${week.weekNumber}`.includes(term)
    );
  }, [weeklyList, searchTerm]);

  // Prepare weekly chart data (chronological from oldest to newest)
  const weeklyChartData = useMemo(() => {
    return [...weeklyList].reverse().map((w) => ({
      label: `W${w.weekNumber}`,
      fullLabel: w.weekLabel,
      amount: w.totalAmount,
      count: w.transactionCount,
      dailyAvg: w.dailyAverage,
    }));
  }, [weeklyList]);

  // Prepare daily chart data (last 21 active days, chronological)
  const dailyChartData = useMemo(() => {
    return [...dailyList]
      .slice(0, 21)
      .reverse()
      .map((d) => ({
        label: d.date.slice(5), // MM-DD
        fullDate: d.date,
        dayOfWeek: d.dayOfWeek,
        amount: d.totalAmount,
        count: d.transactionCount,
      }));
  }, [dailyList]);

  // Find most active day of the week
  const peakWeekday = useMemo(() => {
    if (!dayOfWeekList || dayOfWeekList.length === 0) return null;
    return [...dayOfWeekList].sort((a, b) => b.totalAmount - a.totalAmount)[0];
  }, [dayOfWeekList]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Spending Analytics
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Deep dive into your expense distribution: explore weekly trends and whole day-by-day breakdowns.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl self-start md:self-auto border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'weekly'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Weekly Wise</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              {weeklyList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'daily'
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Whole Day Wise</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              {dailyList.length}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Average */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Daily Spend</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white">
            {formatLKR(metrics.averageDailySpend)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Across {metrics.trackedDaysCount} active spending days
          </p>
        </div>

        {/* Weekly Average */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Weekly Spend</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <CalendarDays className="h-4 w-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white">
            {formatLKR(metrics.averageWeeklySpend)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Across {metrics.trackedWeeksCount} recorded weeks
          </p>
        </div>

        {/* Peak Spending Day */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Peak Spending Day</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Award className="h-4 w-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white">
            {metrics.peakDay ? formatLKR(metrics.peakDay.amount) : '—'}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {metrics.peakDay ? `Recorded on ${metrics.peakDay.date}` : 'No records yet'}
          </p>
        </div>

        {/* Peak Spending Week */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Peak Spending Week</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white">
            {metrics.peakWeek ? formatLKR(metrics.peakWeek.amount) : '—'}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 truncate" title={metrics.peakWeek?.weekLabel}>
            {metrics.peakWeek ? metrics.peakWeek.weekLabel : 'No records yet'}
          </p>
        </div>
      </div>

      {/* ===================== TAB 1: WEEKLY WISE ===================== */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          {/* Weekly Chart */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Weekly Spending Trajectory
                </h3>
                <p className="text-xs text-zinc-500">
                  Chronological spending trajectory grouped week-by-week
                </p>
              </div>
              <span className="text-xs font-medium text-zinc-400">
                {weeklyList.length} Weeks Recorded
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                  <XAxis
                    dataKey="label"
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
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl bg-zinc-900 p-3 text-white shadow-xl text-xs space-y-1">
                            <p className="font-semibold text-zinc-200">{d.fullLabel}</p>
                            <p className="text-emerald-400 font-bold text-sm">
                              {formatLKR(d.amount)}
                            </p>
                            <p className="text-zinc-400 text-[11px]">
                              {d.count} transactions • Daily Avg: {formatLKR(d.dailyAvg)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Accordion Breakdown List */}
          <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Week-by-Week Expense Ledger
                </h3>
                <p className="text-xs text-zinc-500">
                  Click on any week to view individual days and daily expenditure
                </p>
              </div>

              {/* Search filter */}
              <div className="relative min-w-[200px]">
                <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by week or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredWeeklyList.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No weekly records found matching search.
                </div>
              ) : (
                filteredWeeklyList.map((week) => {
                  const isExpanded = expandedWeekKey === week.weekLabel;
                  return (
                    <div key={week.weekLabel} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      {/* Week Header Row */}
                      <button
                        onClick={() => toggleWeek(week.weekLabel)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left focus:outline-none"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-white">
                              {week.weekLabel}
                            </span>
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              Week {week.weekNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-400">
                            <span>{week.days.length} active days</span>
                            <span>•</span>
                            <span>{week.transactionCount} transactions</span>
                            <span>•</span>
                            <span>
                              Top: <strong className="text-zinc-600 dark:text-zinc-300 font-medium">{week.topCategory}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                              {formatLKR(week.totalAmount)}
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              Avg {formatLKR(week.dailyAverage)} / day
                            </div>
                          </div>
                          <div className="text-zinc-400">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded Days inside Week */}
                      {isExpanded && (
                        <div className="bg-zinc-50/70 dark:bg-zinc-950/50 px-4 sm:px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/80">
                          <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-3 uppercase tracking-wider">
                            Daily breakdown for this week
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {week.days.map((day) => (
                              <div
                                key={day.date}
                                onClick={() => {
                                  setActiveTab('daily');
                                  setSelectedDateFilter(day.date);
                                  setExpandedDayKey(day.date);
                                }}
                                className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-3 shadow-2xs hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 transition-all"
                                title="Click to view full day details"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                                    {day.dayOfWeek}, {day.date}
                                  </span>
                                  <span className="text-[11px] text-zinc-400">
                                    {day.transactionCount} txns
                                  </span>
                                </div>
                                <div className="mt-2 text-right font-bold text-sm text-emerald-600 dark:text-emerald-400">
                                  {formatLKR(day.amount)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: WHOLE DAY WISE ===================== */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Charts Row: Day-by-Day Timeline + Day-of-Week Habits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {/* Daily Timeline */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Recent Daily Spending Timeline
                </h3>
                <p className="text-xs text-zinc-500">Day-by-day expense totals (last 21 active days)</p>
              </div>
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                    <XAxis
                      dataKey="label"
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
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-xl bg-zinc-900 p-3 text-white shadow-xl text-xs space-y-1">
                              <p className="font-semibold text-zinc-200">
                                {d.dayOfWeek}, {d.fullDate}
                              </p>
                              <p className="text-emerald-400 font-bold text-sm">
                                {formatLKR(d.amount)}
                              </p>
                              <p className="text-zinc-400 text-[11px]">
                                {d.count} transactions on this day
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="amount" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Day of Week Habits */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Spending Habits by Day of Week
                </h3>
                <p className="text-xs text-zinc-500">
                  Distribution across Monday to Sunday {peakWeekday ? `(Peak: ${peakWeekday.dayName}s)` : ''}
                </p>
              </div>
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeekList} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                    <XAxis
                      dataKey="dayName"
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
                      formatter={(val: any) => [formatLKR(Number(val)), 'Total Spent']}
                      labelFormatter={(label) => `${label}`}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="totalAmount" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Daily Ledger List */}
          <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            {/* Header with Search & Date filter */}
            <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Whole Day Expense Ledger
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Showing {filteredDailyList.length} days. Click any date to expand and inspect all transactions for that whole day.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by category, memo, or day of week..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>

                {/* Specific Date Picker */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <input
                    type="date"
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                    className="rounded-xl border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                  {selectedDateFilter && (
                    <button
                      onClick={() => setSelectedDateFilter('')}
                      className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Daily Rows */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredDailyList.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No daily records found matching criteria.
                </div>
              ) : (
                filteredDailyList.map((day) => {
                  const isExpanded = expandedDayKey === day.date;
                  const isPeak = metrics.peakDay?.date === day.date;

                  return (
                    <div key={day.date} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      {/* Day Header Row */}
                      <button
                        onClick={() => toggleDay(day.date)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left focus:outline-none"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-white">
                              {day.dayOfWeek}, {day.date}
                            </span>
                            {isPeak && (
                              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                                PEAK SPEND DAY
                              </span>
                            )}
                            <span className="text-xs text-zinc-400">
                              ({day.transactionCount} {day.transactionCount === 1 ? 'item' : 'items'})
                            </span>
                          </div>

                          {/* Category pills for the day */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {day.categoryBreakdown.map((cat) => (
                              <span
                                key={cat.category}
                                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                                  CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other
                                }`}
                              >
                                {cat.category}: {formatLKR(cat.amount)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                              {formatLKR(day.totalAmount)}
                            </div>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              {isExpanded ? 'Hide Items' : 'View All Items'}
                            </div>
                          </div>
                          <div className="text-zinc-400">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded Whole Day Itemized Expenses */}
                      {isExpanded && (
                        <div className="bg-zinc-50/70 dark:bg-zinc-950/60 px-4 sm:px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/80">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Receipt className="h-3.5 w-3.5" />
                              All expenses for {day.dayOfWeek}, {day.date}
                            </h4>
                            <span className="text-xs font-medium text-zinc-500">
                              Day Total: <strong>{formatLKR(day.totalAmount)}</strong>
                            </span>
                          </div>

                          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                            {day.expenses && day.expenses.length > 0 ? (
                              day.expenses.map((expense: Expense) => (
                                <div
                                  key={expense.id}
                                  className="p-3 sm:p-4 flex items-center justify-between text-xs sm:text-sm"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                                          CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other
                                        }`}
                                      >
                                        {expense.category}
                                      </span>
                                      {expense.sub_category && (
                                        <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                                          {expense.sub_category}
                                        </span>
                                      )}
                                    </div>
                                    {expense.description && (
                                      <p className="text-zinc-600 dark:text-zinc-300 text-xs">
                                        {expense.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="text-right font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                                    {formatLKR(expense.amount)}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-xs text-zinc-400">
                                No individual transaction items available.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
