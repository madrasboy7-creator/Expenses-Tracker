import React from 'react';
import { CategorySummary } from '@/types/expense';
import { formatINR } from '@/lib/expenses/currency';
import { CategoryBadge, CATEGORY_CONFIG } from './CategoryBadge';
import { PieChart } from 'lucide-react';

interface CategoryBarChartProps {
  categories: CategorySummary[];
  totalMonthlySpend: number;
}

export function CategoryBarChart({
  categories,
  totalMonthlySpend,
}: CategoryBarChartProps) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
          <PieChart size={20} />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No category spending recorded for this month.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((item) => {
        const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.Other;
        return (
          <div key={item.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CategoryBadge category={item.category} size="sm" />
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  ({item.count} {item.count === 1 ? 'txn' : 'txns'})
                </span>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatINR(item.total)}
                </span>
                <span className="font-medium text-slate-500 dark:text-slate-400 w-12 text-right text-[11px]">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(item.percentage, 100)}%`,
                  backgroundColor: config.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
