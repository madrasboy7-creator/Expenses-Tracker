'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  ReceiptText,
  TrendingDown,
  ArrowRight,
  Plus,
  Calendar,
  AlertCircle,
  Loader2,
  Sparkles,
  Target,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { MonthSelector } from '@/components/MonthSelector';
import { SpendingTrendChart } from '@/components/SpendingTrendChart';
import { CategoryBarChart } from '@/components/CategoryBarChart';
import { CategoryBadge } from '@/components/CategoryBadge';
import { ExpenseModal } from '@/components/ExpenseModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { MonthlyLimitCard } from '@/components/MonthlyLimitCard';
import { ConfigNotice } from '@/components/ConfigNotice';
import { useExpenses } from '@/lib/expenses/useExpenses';
import { formatINR } from '@/lib/expenses/currency';
import { formatDateDisplay, getCurrentYearMonth, getMonthLabel } from '@/lib/expenses/date-utils';
import { Expense, ExpenseCategory } from '@/types/expense';

export default function DashboardPage() {
  const initialYM = getCurrentYearMonth();
  const [selectedYear, setSelectedYear] = useState(initialYM.year);
  const [selectedMonth, setSelectedMonth] = useState(initialYM.month);

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
    setMonthlyLimit,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses(selectedYear, selectedMonth);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick stats
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;
  const avgPerTxn = transactionCount > 0 ? monthlyTotal / transactionCount : 0;
  const recentExpenses = monthExpenses.slice(0, 5);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (expense: Expense) => {
    setDeletingExpense(expense);
  };

  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;
    setIsDeleting(true);
    await deleteExpense(deletingExpense.id);
    setIsDeleting(false);
    setDeletingExpense(null);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-8">
      <Navbar onOpenAddExpense={handleOpenAdd} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <ConfigNotice />

        {/* Top Header / Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Monthly Overview
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                INR ₹
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Tracking spending for <span className="font-semibold text-slate-700 dark:text-slate-300">{getMonthLabel(selectedYear, selectedMonth)}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <MonthSelector
              year={selectedYear}
              month={selectedMonth}
              onChange={(y, m) => {
                setSelectedYear(y);
                setSelectedMonth(m);
              }}
            />
            <button
              type="button"
              onClick={handleOpenAdd}
              id="dashboard-add-expense-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/25 transition-all cursor-pointer shrink-0"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle size={18} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Optional Monthly Spending Limit & Balance Deduction Card */}
        <MonthlyLimitCard
          year={selectedYear}
          month={selectedMonth}
          monthlyLimit={monthlyLimit}
          monthlyTotal={monthlyTotal}
          remainingBalance={remainingBalance}
          percentUsed={percentUsed}
          isOverLimit={isOverLimit}
          onSetLimit={setMonthlyLimit}
        />

        {/* Top Summary KPI Cards */}
        <div className={`grid grid-cols-1 ${monthlyLimit !== null ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
          {/* Card 1: Total Spending */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Expenses
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <IndianRupee size={16} strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {loading ? (
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
              ) : (
                formatINR(monthlyTotal)
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
              <span>{monthExpenses.length} transactions</span>
            </p>
          </div>

          {/* Card 2: If limit is set, Remaining Balance; Else: Transactions */}
          {monthlyLimit !== null ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Remaining Budget
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isOverLimit
                      ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  <Target size={16} strokeWidth={2.5} />
                </div>
              </div>
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isOverLimit
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {loading ? (
                  <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
                ) : remainingBalance !== null ? (
                  formatINR(remainingBalance)
                ) : (
                  '₹0.00'
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {isOverLimit ? 'Limit exceeded' : `From ${formatINR(monthlyLimit)} limit`}
              </p>
            </div>
          ) : (
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Transactions
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ReceiptText size={16} strokeWidth={2.2} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {loading ? (
                  <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
                ) : (
                  transactionCount
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Avg {formatINR(avgPerTxn)} per transaction
              </p>
            </div>
          )}

          {/* Card 3: Top Spending Category */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Top Category
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles size={16} strokeWidth={2.2} />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
            ) : topCategory ? (
              <div>
                <div className="flex items-center gap-2">
                  <CategoryBadge category={topCategory.category} size="md" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  {formatINR(topCategory.total)} ({topCategory.percentage.toFixed(0)}% of month)
                </p>
              </div>
            ) : (
              <div>
                <div className="text-sm font-semibold text-slate-400">No expenses</div>
                <p className="text-xs text-slate-400 mt-1">Start by adding your first expense</p>
              </div>
            )}
          </div>

          {/* Card 4 (if limit is set): Transactions count */}
          {monthlyLimit !== null && (
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Transactions
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ReceiptText size={16} strokeWidth={2.2} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {loading ? (
                  <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
                ) : (
                  transactionCount
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Avg {formatINR(avgPerTxn)} per transaction
              </p>
            </div>
          )}
        </div>

        {/* Charts & Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Monthly Trend Chart (3 cols on large) */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900/80 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
            <SpendingTrendChart
              data={monthlyTrends}
              selectedMonth={{ year: selectedYear, month: selectedMonth }}
            />
          </div>

          {/* Category Breakdown (2 cols on large) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/80 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Category Breakdown
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {categoryBreakdown.length} active
              </span>
            </div>
            <CategoryBarChart
              categories={categoryBreakdown}
              totalMonthlySpend={monthlyTotal}
            />
          </div>
        </div>

        {/* Recent Expenses List */}
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Expenses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest transactions for {getMonthLabel(selectedYear, selectedMonth)}
              </p>
            </div>
            <Link
              href="/expenses"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:underline"
            >
              <span>View all expenses</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 size={24} className="animate-spin text-emerald-600 mb-2" />
              <span className="text-xs">Loading records...</span>
            </div>
          ) : recentExpenses.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <ReceiptText size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No expenses recorded yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
                You haven&apos;t recorded any expenses for {getMonthLabel(selectedYear, selectedMonth)}. Tap the button below to add one.
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Add First Expense</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="py-3.5 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryBadge
                      category={expense.category}
                      customCategory={expense.custom_category}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">
                        {expense.description || expense.custom_category || expense.category}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatDateDisplay(expense.expense_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatINR(expense.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(expense)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-emerald-500 transition-opacity p-1 cursor-pointer"
                      title="Edit expense"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        initialExpense={editingExpense}
        onSave={async (data) => {
          if (data.id) {
            return await updateExpense(data.id, data);
          } else {
            return await addExpense(data);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingExpense)}
        expense={deletingExpense}
        isDeleting={isDeleting}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
