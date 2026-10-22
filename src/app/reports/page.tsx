'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Receipt,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  Calendar,
  Layers,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CategoryBadge, CATEGORY_CONFIG } from '@/components/CategoryBadge';
import { SpendingTrendChart } from '@/components/SpendingTrendChart';
import { ConfigNotice } from '@/components/ConfigNotice';
import { useExpenses } from '@/lib/expenses/useExpenses';
import { formatINR } from '@/lib/expenses/currency';
import {
  getCurrentYearMonth,
  getMonthLabel,
  getNeighborMonths,
} from '@/lib/expenses/date-utils';
import { downloadExpensesCsv } from '@/lib/expenses/csv';

export default function ReportsPage() {
  const currentYM = getCurrentYearMonth();
  const [selectedYear, setSelectedYear] = useState(currentYM.year);
  const [selectedMonth, setSelectedMonth] = useState(currentYM.month);

  const { prev, next, canGoPrev } = getNeighborMonths(selectedYear, selectedMonth);

  const {
    monthExpenses,
    monthlyTotal,
    transactionCount,
    categoryBreakdown,
    monthlyTrends,
    monthlyLimit,
    remainingBalance,
    percentUsed,
    isOverLimit,
    loading,
    error,
  } = useExpenses(selectedYear, selectedMonth);

  // Highest transaction in the month
  const maxTransaction = useMemo(() => {
    if (monthExpenses.length === 0) return null;
    return monthExpenses.reduce((max, item) => (item.amount > max.amount ? item : max), monthExpenses[0]);
  }, [monthExpenses]);

  // Export current month report to CSV
  const handleExportMonthCsv = () => {
    const filename = `expenses_${getMonthLabel(selectedYear, selectedMonth).toLowerCase().replace(/\s+/g, '_')}.csv`;
    downloadExpensesCsv(monthExpenses, filename);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <ConfigNotice />

        {/* Top Month Navigation Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Monthly Spending Report
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                Analysis
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Category breakdowns, transaction counts, and multi-month comparison.
            </p>
          </div>

          {/* Month Selector Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-1 shadow-xs">
              <button
                type="button"
                onClick={() => canGoPrev && setSelectedYear(prev.year) && setSelectedMonth(prev.month)}
                disabled={!canGoPrev}
                title={canGoPrev ? `Go to ${getMonthLabel(prev.year, prev.month)}` : 'Tracker starts from October 2026'}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">{getMonthLabel(prev.year, prev.month)}</span>
              </button>
              <div className="px-3 py-1 font-bold text-xs sm:text-sm text-slate-900 dark:text-white border-x border-slate-200 dark:border-slate-700 whitespace-nowrap">
                {getMonthLabel(selectedYear, selectedMonth)}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedYear(next.year);
                  setSelectedMonth(next.month);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <span className="hidden sm:inline">{getMonthLabel(next.year, next.month)}</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportMonthCsv}
              disabled={monthExpenses.length === 0}
              title="Download CSV for this month"
              className="p-2 sm:px-3 sm:py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle size={18} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Report KPI Metrics */}
        <div className={`grid grid-cols-1 ${monthlyLimit !== null ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Spent in {getMonthLabel(selectedYear, selectedMonth)}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {formatINR(monthlyTotal)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across {transactionCount} {transactionCount === 1 ? 'transaction' : 'transactions'}
            </p>
          </div>

          {monthlyLimit !== null && (
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Remaining Budget
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    isOverLimit
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  }`}
                >
                  {isOverLimit ? 'Over Budget' : 'Within Limit'}
                </span>
              </div>
              <div
                className={`text-2xl sm:text-3xl font-black mt-2 ${
                  isOverLimit
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {remainingBalance !== null ? formatINR(remainingBalance) : '₹0.00'}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Limit: {formatINR(monthlyLimit)} ({percentUsed?.toFixed(0)}% used)
              </p>
            </div>
          )}

          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Categories Active
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {categoryBreakdown.length} / 6
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Distinct spending categories
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Highest Single Transaction
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {maxTransaction ? formatINR(maxTransaction.amount) : '₹0.00'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {maxTransaction ? `${maxTransaction.category} • ${maxTransaction.description || 'No note'}` : 'None recorded'}
            </p>
          </div>
        </div>

        {/* Monthly Comparison Chart */}
        <div className="bg-white dark:bg-slate-900/80 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <SpendingTrendChart
            data={monthlyTrends}
            selectedMonth={{ year: selectedYear, month: selectedMonth }}
          />
        </div>

        {/* Category-Wise Breakdown Table & Distribution */}
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Category Spending Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed breakdown for {getMonthLabel(selectedYear, selectedMonth)}
              </p>
            </div>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No expenses recorded for this month to generate category report.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3 text-center">Transactions</th>
                      <th className="py-3 px-3 text-right">Total Spent</th>
                      <th className="py-3 px-3 text-right">Share of Month</th>
                      <th className="py-3 px-3 w-1/3">Distribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {categoryBreakdown.map((item) => {
                      const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.Other;
                      return (
                        <tr key={item.category} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="py-3.5 px-3">
                            <CategoryBadge category={item.category} size="md" />
                          </td>
                          <td className="py-3.5 px-3 text-center font-medium text-slate-600 dark:text-slate-300">
                            {item.count}
                          </td>
                          <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                            {formatINR(item.total)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-semibold text-slate-600 dark:text-slate-300">
                            {item.percentage.toFixed(1)}%
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(item.percentage, 100)}%`,
                                  backgroundColor: config.color,
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
