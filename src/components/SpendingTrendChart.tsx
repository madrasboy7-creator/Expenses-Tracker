'use client';

import React, { useState } from 'react';
import { MonthlyTrendItem } from '@/types/expense';
import { formatINR } from '@/lib/expenses/currency';
import { TrendingUp } from 'lucide-react';

interface SpendingTrendChartProps {
  data: MonthlyTrendItem[];
  selectedMonth?: { year: number; month: number };
}

export function SpendingTrendChart({
  data,
  selectedMonth,
}: SpendingTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
        No monthly trend data available yet.
      </div>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const chartHeight = 160;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={16} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            6-Month Spending Trend
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Amounts in INR (₹)
        </span>
      </div>

      {/* SVG Responsive Bar Chart */}
      <div className="relative pt-6 pb-2">
        {/* Tooltip */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs shadow-lg pointer-events-none transition-all flex items-center gap-2 z-10"
          >
            <span className="font-semibold">{data[hoveredIndex].monthLabel}:</span>
            <span>{formatINR(data[hoveredIndex].total)}</span>
            <span className="opacity-75">({data[hoveredIndex].count} txns)</span>
          </div>
        )}

        <div className="flex items-end justify-between gap-2 sm:gap-4 h-44 px-2 border-b border-slate-200 dark:border-slate-800">
          {data.map((item, index) => {
            const isSelected =
              selectedMonth &&
              selectedMonth.year === item.year &&
              selectedMonth.month === item.month;
            
            const barHeightPercent = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
            const minHeight = item.total > 0 ? Math.max(barHeightPercent, 6) : 2;

            return (
              <div
                key={`${item.year}-${item.month}`}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Bar */}
                <div className="w-full max-w-[42px] flex items-end justify-center h-full">
                  <div
                    style={{ height: `${minHeight}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/20'
                        : hoveredIndex === index
                        ? 'bg-emerald-500 dark:bg-emerald-400'
                        : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700'
                    }`}
                  />
                </div>

                {/* Month Label */}
                <div className="mt-2.5 text-center">
                  <span
                    className={`block text-[11px] sm:text-xs transition-colors ${
                      isSelected
                        ? 'font-bold text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.monthLabel}
                  </span>
                  <span className="hidden sm:block text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {formatINR(item.total).split('.')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
