'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Download,
  Calendar,
  AlertCircle,
  Receipt,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CategoryBadge } from '@/components/CategoryBadge';
import { ExpenseModal } from '@/components/ExpenseModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { ConfigNotice } from '@/components/ConfigNotice';
import { useExpenses } from '@/lib/expenses/useExpenses';
import { formatINR } from '@/lib/expenses/currency';
import {
  formatDateDisplay,
  getCurrentYearMonth,
  getMonthBounds,
  getMonthLabel,
  getAvailableMonthOptions,
} from '@/lib/expenses/date-utils';
import { filterExpenses, calculateTotal } from '@/lib/expenses/calculations';
import { downloadExpensesCsv } from '@/lib/expenses/csv';
import { Expense, EXPENSE_CATEGORIES } from '@/types/expense';

export default function ExpensesPage() {
  const currentYM = getCurrentYearMonth();

  // Filters state
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>(
    `${currentYM.year}-${currentYM.month.toString().padStart(2, '0')}`
  ); // 'ALL' or 'YYYY-MM'
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    allExpenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Month options for filter dropdown
  const monthOptions = getAvailableMonthOptions();

  // Compute month bounds if a specific month is selected
  const { monthStart, nextMonthStart } = useMemo(() => {
    if (selectedMonthFilter === 'ALL') {
      return { monthStart: undefined, nextMonthStart: undefined };
    }
    const [yStr, mStr] = selectedMonthFilter.split('-');
    if (yStr && mStr) {
      return getMonthBounds(parseInt(yStr, 10), parseInt(mStr, 10));
    }
    return { monthStart: undefined, nextMonthStart: undefined };
  }, [selectedMonthFilter]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return filterExpenses(allExpenses, {
      monthStart,
      nextMonthStart,
      category: selectedCategory,
      searchQuery,
    });
  }, [allExpenses, monthStart, nextMonthStart, selectedCategory, searchQuery]);

  const filteredTotal = useMemo(
    () => calculateTotal(filteredExpenses),
    [filteredExpenses]
  );

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

  const handleExportCsv = () => {
    let suffix = 'filtered';
    if (selectedMonthFilter !== 'ALL') {
      const [y, m] = selectedMonthFilter.split('-');
      suffix = `${getMonthLabel(parseInt(y, 10), parseInt(m, 10)).toLowerCase().replace(/\s+/g, '_')}`;
    }
    downloadExpensesCsv(filteredExpenses, `expenses_${suffix}.csv`);
  };

  const clearFilters = () => {
    setSelectedMonthFilter('ALL');
    setSelectedCategory('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedMonthFilter !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    searchQuery.trim() !== '';

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-8">
      <Navbar onOpenAddExpense={handleOpenAdd} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <ConfigNotice />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Expense History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              View, search, edit, and organize all your recorded expenses.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredExpenses.length === 0}
              title="Export filtered records to CSV"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              id="history-add-expense-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
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

        {/* Filter Controls Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search description, amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Month Filter */}
            <div className="relative">
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value)}
                aria-label="Filter by Month"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Months & Years</option>
                {monthOptions.map((opt) => (
                  <option
                    key={`${opt.year}-${opt.month}`}
                    value={`${opt.year}-${opt.month.toString().padStart(2, '0')}`}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by Category"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Status Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Showing</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 dark:text-slate-400">Total:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                {formatINR(filteredTotal)}
              </span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 text-xs font-semibold cursor-pointer transition-colors"
              >
                <X size={14} />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Expenses Table / List */}
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
          {filteredExpenses.length === 0 ? (
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <Receipt size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No matching expenses found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
                {hasActiveFilters
                  ? 'No records match your selected month, category, or search query.'
                  : 'You have not added any expenses yet.'}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Clear all filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Add Your First Expense
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4 sm:px-6">Date</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 text-right">Amount (INR)</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                        {formatDateDisplay(expense.expense_date)}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <CategoryBadge
                          category={expense.category}
                          customCategory={expense.custom_category}
                          size="sm"
                        />
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md truncate text-slate-700 dark:text-slate-200">
                        {expense.description ? (
                          <span>{expense.description}</span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">No description</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        {formatINR(expense.amount)}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(expense)}
                            title="Edit expense"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(expense)}
                            title="Delete expense"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
