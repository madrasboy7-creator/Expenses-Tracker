import {
  Expense,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
  CategorySummary,
  MonthlyTrendItem,
} from '@/types/expense';
import { getMonthBounds, getCurrentYearMonth } from './date-utils';

/**
 * Calculates the total sum of amounts for a list of expenses.
 */
export function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

/**
 * Groups expenses by category and returns summary sorted by total descending.
 */
export function calculateCategoryBreakdown(expenses: Expense[]): CategorySummary[] {
  const totalSpend = calculateTotal(expenses);

  const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();
  for (const cat of EXPENSE_CATEGORIES) {
    categoryMap.set(cat, { total: 0, count: 0 });
  }

  for (const expense of expenses) {
    const existing = categoryMap.get(expense.category);
    if (existing) {
      existing.total += Number(expense.amount) || 0;
      existing.count += 1;
    } else {
      categoryMap.set(expense.category, {
        total: Number(expense.amount) || 0,
        count: 1,
      });
    }
  }

  const result: CategorySummary[] = [];

  categoryMap.forEach((val, category) => {
    if (val.count > 0) {
      result.push({
        category,
        displayName: category,
        total: Math.round(val.total * 100) / 100,
        count: val.count,
        percentage: totalSpend > 0 ? (val.total / totalSpend) * 100 : 0,
      });
    }
  });

  return result.sort((a, b) => b.total - a.total);
}

/**
 * Calculates monthly trend data for the last `numberOfMonths` (default 6).
 */
export function calculateMonthlyTrends(
  allExpenses: Expense[],
  numberOfMonths: number = 6,
  endYear?: number,
  endMonth?: number
): MonthlyTrendItem[] {
  const current = getCurrentYearMonth();
  const targetYear = endYear ?? current.year;
  const targetMonth = endMonth ?? current.month;

  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const items: MonthlyTrendItem[] = [];

  for (let i = numberOfMonths - 1; i >= 0; i--) {
    let m = targetMonth - i;
    let y = targetYear;

    while (m < 1) {
      m += 12;
      y -= 1;
    }

    const { monthStart, nextMonthStart } = getMonthBounds(y, m);
    
    // Filter expenses in this specific month
    const monthExpenses = allExpenses.filter(
      (e) => e.expense_date >= monthStart && e.expense_date < nextMonthStart
    );

    const total = calculateTotal(monthExpenses);

    items.push({
      year: y,
      month: m,
      monthLabel: `${shortMonths[m - 1]} '${y.toString().slice(-2)}`,
      total: Math.round(total * 100) / 100,
      count: monthExpenses.length,
    });
  }

  return items;
}

/**
 * Filters expenses by date boundary, category, and text search query.
 */
export function filterExpenses(
  expenses: Expense[],
  options: {
    monthStart?: string;
    nextMonthStart?: string;
    category?: string;
    searchQuery?: string;
  }
): Expense[] {
  return expenses.filter((item) => {
    // Month boundary check: expense_date >= month_start AND expense_date < next_month_start
    if (options.monthStart && item.expense_date < options.monthStart) {
      return false;
    }
    if (options.nextMonthStart && item.expense_date >= options.nextMonthStart) {
      return false;
    }

    // Category filter
    if (options.category && options.category !== 'ALL' && item.category !== options.category) {
      return false;
    }

    // Search query across description, custom_category, category, amount, date
    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.trim().toLowerCase();
      const descMatch = (item.description || '').toLowerCase().includes(q);
      const customCatMatch = (item.custom_category || '').toLowerCase().includes(q);
      const categoryMatch = item.category.toLowerCase().includes(q);
      const amountMatch = item.amount.toString().includes(q);
      const dateMatch = item.expense_date.includes(q);

      if (!descMatch && !customCatMatch && !categoryMatch && !amountMatch && !dateMatch) {
        return false;
      }
    }

    return true;
  });
}
