'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  getMonthLabel,
  getNeighborMonths,
  getAvailableMonthOptions,
} from '@/lib/expenses/date-utils';

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
  showNavButtons?: boolean;
}

export function MonthSelector({
  year,
  month,
  onChange,
  showNavButtons = true,
}: MonthSelectorProps) {
  const { prev, next, canGoPrev } = getNeighborMonths(year, month);
  const options = getAvailableMonthOptions();

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [selectedYearStr, selectedMonthStr] = e.target.value.split('-');
    if (selectedYearStr && selectedMonthStr) {
      onChange(parseInt(selectedYearStr, 10), parseInt(selectedMonthStr, 10));
    }
  };

  const currentValue = `${year}-${month.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xs">
      {showNavButtons && (
        <button
          type="button"
          onClick={() => canGoPrev && onChange(prev.year, prev.month)}
          disabled={!canGoPrev}
          aria-label="Previous Month"
          title={canGoPrev ? `Go to ${getMonthLabel(prev.year, prev.month)}` : 'Tracker starts from October 2026'}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      <div className="relative flex items-center px-2">
        <Calendar size={15} className="text-emerald-600 dark:text-emerald-400 mr-2 shrink-0" />
        <span className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
          {getMonthLabel(year, month)}
        </span>

        {/* Hidden styled select over the label for direct picker */}
        <select
          value={currentValue}
          onChange={handleSelectChange}
          aria-label="Select Month and Year"
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer text-slate-900 dark:text-white dark:bg-slate-900"
        >
          {options.map((opt) => (
            <option
              key={`${opt.year}-${opt.month}`}
              value={`${opt.year}-${opt.month.toString().padStart(2, '0')}`}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {showNavButtons && (
        <button
          type="button"
          onClick={() => onChange(next.year, next.month)}
          aria-label="Next Month"
          title={`Go to ${getMonthLabel(next.year, next.month)}`}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
