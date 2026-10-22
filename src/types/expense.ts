export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Shopping',
  'Education',
  'Entertainment',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  custom_category?: string | null;
  description: string | null;
  expense_date: string; // ISO date 'YYYY-MM-DD'
  created_at: string;
  updated_at: string;
}

export interface ExpenseFormData {
  amount: string; // string input to handle form state cleanly
  category: ExpenseCategory;
  custom_category?: string;
  expense_date: string; // 'YYYY-MM-DD'
  description: string;
}

export interface MonthlyLimit {
  id?: string;
  user_id?: string;
  year: number;
  month: number;
  limit_amount: number;
}

export interface CategorySummary {
  category: ExpenseCategory;
  displayName: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthOption {
  year: number;
  month: number; // 1-12
  label: string; // e.g. "October 2026"
  start_date: string; // 'YYYY-MM-01'
  end_date_exclusive: string; // First day of next month
}

export interface MonthlyTrendItem {
  year: number;
  month: number;
  monthLabel: string; // 'Oct 2026' or 'Oct'
  total: number;
  count: number;
}
