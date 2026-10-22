'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Expense } from '@/types/expense';
import { formatINR } from '@/lib/expenses/currency';
import { formatDateDisplay } from '@/lib/expenses/date-utils';
import { CategoryBadge } from './CategoryBadge';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  expense: Expense | null;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  expense,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 id="delete-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
              Delete Expense
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Expense Card summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 mb-5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <CategoryBadge category={expense.category} size="sm" />
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {formatINR(expense.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Date: {formatDateDisplay(expense.expense_date)}</span>
          </div>
          {expense.description && (
            <p className="text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200/60 dark:border-slate-700/50">
              &ldquo;{expense.description}&rdquo;
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            id="confirm-delete-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-rose-600/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Expense</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
