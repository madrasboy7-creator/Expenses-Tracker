'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  IndianRupee,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  Tag,
  Edit3,
} from 'lucide-react';
import {
  Expense,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
} from '@/types/expense';
import { getTodayDateString } from '@/lib/expenses/date-utils';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    amount: number;
    category: ExpenseCategory;
    custom_category?: string | null;
    expense_date: string;
    description: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
  initialExpense?: Expense | null;
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  initialExpense,
}: ExpenseModalProps) {
  const isEditing = Boolean(initialExpense?.id);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(getTodayDateString());
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state when initialExpense changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialExpense) {
        setAmount(initialExpense.amount.toString());
        setCategory(initialExpense.category);
        setCustomCategory(initialExpense.custom_category || '');
        setExpenseDate(initialExpense.expense_date);
        setDescription(initialExpense.description || '');
      } else {
        setAmount('');
        setCategory('Food');
        setCustomCategory('');
        setExpenseDate(getTodayDateString());
        setDescription('');
      }
      setErrorMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialExpense]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg(null);

    // Validation
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₹0.00');
      return;
    }

    if (!category || !EXPENSE_CATEGORIES.includes(category)) {
      setErrorMsg('Please select a valid expense category');
      return;
    }

    if (category === 'Other' && !customCategory.trim()) {
      setErrorMsg('Please specify the category name for Other');
      return;
    }

    if (!expenseDate) {
      setErrorMsg('Please select a valid expense date');
      return;
    }

    if (description.length > 500) {
      setErrorMsg('Description must be 500 characters or less');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await onSave({
        id: initialExpense?.id,
        amount: parsedAmount,
        category,
        custom_category: category === 'Other' ? customCategory.trim() : null,
        expense_date: expenseDate,
        description: description.trim() ? description.trim() : null,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to save expense. Please try again.');
        setIsSubmitting(false);
      } else {
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2
              id="expense-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              {isEditing ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record daily spending in Indian Rupees (₹)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount input */}
          <div>
            <label
              htmlFor="expense-amount"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Amount (INR ₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <IndianRupee size={18} strokeWidth={2.5} />
              </div>
              <input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
                autoFocus
                className="block w-full pl-10 pr-4 py-2.5 text-base font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label
              htmlFor="expense-category"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Tag size={18} />
              </div>
              <select
                id="expense-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                disabled={isSubmitting}
                className="block w-full pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:bg-white dark:focus:bg-slate-800 transition-colors cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'Other' ? 'Other (Manual category)' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* If Other is selected, show manual category input */}
          {category === 'Other' && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5 animate-in fade-in duration-150">
              <label
                htmlFor="custom-category"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Mention Category Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Edit3 size={15} />
                </div>
                <input
                  id="custom-category"
                  type="text"
                  required
                  placeholder="e.g., Health, Bills, Fitness, Rent, Gifts..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  disabled={isSubmitting}
                  className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Type your custom category name manually.
              </p>
            </div>
          )}

          {/* Expense Date */}
          <div>
            <label
              htmlFor="expense-date"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Expense Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Calendar size={18} />
              </div>
              <input
                id="expense-date"
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                disabled={isSubmitting}
                className="block w-full pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:bg-white dark:focus:bg-slate-800 transition-colors cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Recorded in Asia/Kolkata reporting timezone.
            </p>
          </div>

          {/* Description (Optional, max 500 chars) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="expense-description"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Description / Note <span className="text-slate-400 text-xs font-normal lowercase">(optional)</span>
              </label>
              <span
                className={`text-[11px] ${
                  description.length > 500 ? 'text-rose-500 font-semibold' : 'text-slate-400'
                }`}
              >
                {description.length}/500
              </span>
            </div>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                <FileText size={18} />
              </div>
              <textarea
                id="expense-description"
                rows={3}
                maxLength={500}
                placeholder="e.g., Grocery shopping at DMart, monthly metro pass..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="block w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:bg-white dark:focus:bg-slate-800 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="save-expense-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-sm font-semibold shadow-sm shadow-emerald-600/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Expense' : 'Save Expense'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
