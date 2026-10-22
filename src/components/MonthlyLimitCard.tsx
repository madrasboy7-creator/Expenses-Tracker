'use client';

import React, { useState } from 'react';
import {
  Target,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  TrendingDown,
} from 'lucide-react';
import { formatINR } from '@/lib/expenses/currency';
import { getMonthLabel } from '@/lib/expenses/date-utils';

interface MonthlyLimitCardProps {
  year: number;
  month: number;
  monthlyLimit: number | null;
  monthlyTotal: number;
  remainingBalance: number | null;
  percentUsed: number | null;
  isOverLimit: boolean;
  onSetLimit: (amount: number | null) => Promise<{ success: boolean; error?: string }>;
}

export function MonthlyLimitCard({
  year,
  month,
  monthlyLimit,
  monthlyTotal,
  remainingBalance,
  percentUsed,
  isOverLimit,
  onSetLimit,
}: MonthlyLimitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [limitInput, setLimitInput] = useState(monthlyLimit ? monthlyLimit.toString() : '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const monthName = getMonthLabel(year, month);

  const handleOpenEdit = () => {
    setLimitInput(monthlyLimit ? monthlyLimit.toString() : '');
    setErrorMsg(null);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const val = parseFloat(limitInput);
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Please enter a valid limit amount greater than ₹0');
      return;
    }

    setIsSaving(true);
    const res = await onSetLimit(val);
    setIsSaving(false);

    if (res.success) {
      setIsEditing(false);
    } else {
      setErrorMsg(res.error || 'Failed to save limit');
    }
  };

  const handleRemove = async () => {
    if (!confirm(`Are you sure you want to remove the spending limit for ${monthName}?`)) {
      return;
    }
    setIsSaving(true);
    await onSetLimit(null);
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all">
      {/* Editing State */}
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Target size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Set Spending Limit for {monthName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Expenses will be deducted dynamically from this limit
                </p>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Monthly Limit Amount (INR ₹)
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <IndianRupee size={16} strokeWidth={2.5} />
              </div>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="e.g. 50000"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                disabled={isSaving}
                autoFocus
                className="block w-full pl-9 pr-4 py-2 text-sm font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            {monthlyLimit !== null && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isSaving}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer mr-auto"
              >
                Remove Limit
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>Save Limit</span>
            </button>
          </div>
        </form>
      ) : monthlyLimit === null ? (
        /* No Limit Set State (Optional) */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
              <Target size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Monthly Spending Limit
                </h3>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Optional
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set a monthly budget limit for {monthName} to track how much you have left after expenses.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenEdit}
            id="set-monthly-limit-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer"
          >
            <Plus size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span>Set Spending Limit</span>
          </button>
        </div>
      ) : (
        /* Limit Active State */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${
                  isOverLimit
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isOverLimit ? <AlertTriangle size={18} /> : <Target size={18} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {monthName} Spending Limit
                  </h3>
                  {isOverLimit ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400">
                      Over Budget
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400">
                      On Track
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Limit: {formatINR(monthlyLimit)} • Total Spent: {formatINR(monthlyTotal)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <button
                type="button"
                onClick={handleOpenEdit}
                title="Edit limit"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Edit2 size={15} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                title="Remove limit"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                {percentUsed !== null ? `${percentUsed.toFixed(1)}% of limit spent` : ''}
              </span>
              <span
                className={`font-black text-sm ${
                  isOverLimit
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {remainingBalance !== null && remainingBalance >= 0
                  ? `${formatINR(remainingBalance)} Remaining`
                  : `Over by ${formatINR(Math.abs(remainingBalance || 0))}`}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverLimit
                    ? 'bg-rose-500'
                    : (percentUsed || 0) > 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(percentUsed || 0, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>₹0.00</span>
              <span>Limit: {formatINR(monthlyLimit)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
