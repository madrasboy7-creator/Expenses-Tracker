'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Expense, ExpenseCategory } from '@/types/expense';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  calculateTotal,
  calculateCategoryBreakdown,
  calculateMonthlyTrends,
} from './calculations';
import { getMonthBounds, getCurrentYearMonth } from './date-utils';

export function useExpenses(selectedYear?: number, selectedMonth?: number) {
  const { user } = useAuth();
  const configured = isSupabaseConfigured();

  const current = getCurrentYearMonth();
  const activeYear = selectedYear ?? current.year;
  const activeMonth = selectedMonth ?? current.month;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [limitsMap, setLimitsMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchExpensesAndLimits = useCallback(async () => {
    setLoading(true);
    setError(null);

    // If Supabase is configured and user is logged in, fetch from database
    if (configured && user) {
      try {
        // Fetch expenses
        const { data: expData, error: expErr } = await supabase
          .from('expenses')
          .select('*')
          .order('expense_date', { ascending: false })
          .order('created_at', { ascending: false });

        if (expErr) throw expErr;

        const loaded: Expense[] = (expData || []).map((row) => ({
          id: row.id,
          user_id: row.user_id,
          amount: Number(row.amount),
          category: row.category as ExpenseCategory,
          custom_category: row.custom_category || null,
          description: row.description,
          expense_date: row.expense_date,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));

        setExpenses(loaded);

        // Fetch monthly limits
        const { data: limData } = await supabase
          .from('monthly_limits')
          .select('*');

        if (limData) {
          const newMap: Record<string, number> = {};
          limData.forEach((row) => {
            newMap[`${row.year}-${row.month}`] = Number(row.limit_amount);
          });
          setLimitsMap(newMap);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(msg);
      } finally {
        setLoading(false);
      }
    } else {
      // In local preview mode (when Supabase credentials are not configured yet)
      const storedExp = localStorage.getItem('lucifer_expenses');
      if (storedExp) {
        try {
          setExpenses(JSON.parse(storedExp));
        } catch {
          setExpenses([]);
        }
      } else {
        setExpenses([]);
      }

      const storedLimits = localStorage.getItem('lucifer_monthly_limits');
      if (storedLimits) {
        try {
          setLimitsMap(JSON.parse(storedLimits));
        } catch {
          setLimitsMap({});
        }
      } else {
        setLimitsMap({});
      }
      setLoading(false);
    }
  }, [configured, user, supabase]);

  useEffect(() => {
    fetchExpensesAndLimits();
  }, [fetchExpensesAndLimits]);

  // Set / Clear Monthly Limit
  const setMonthlyLimit = async (limitAmount: number | null): Promise<{ success: boolean; error?: string }> => {
    const key = `${activeYear}-${activeMonth}`;
    const updatedMap = { ...limitsMap };

    if (limitAmount === null || limitAmount <= 0) {
      delete updatedMap[key];
    } else {
      updatedMap[key] = limitAmount;
    }

    setLimitsMap(updatedMap);

    if (configured && user) {
      try {
        if (limitAmount === null || limitAmount <= 0) {
          await supabase
            .from('monthly_limits')
            .delete()
            .match({ user_id: user.id, year: activeYear, month: activeMonth });
        } else {
          await supabase
            .from('monthly_limits')
            .upsert(
              {
                user_id: user.id,
                year: activeYear,
                month: activeMonth,
                limit_amount: limitAmount,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,year,month' }
            );
        }
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to save limit';
        return { success: false, error: msg };
      }
    } else {
      localStorage.setItem('lucifer_monthly_limits', JSON.stringify(updatedMap));
      return { success: true };
    }
  };

  // Add Expense
  const addExpense = async (data: {
    amount: number;
    category: ExpenseCategory;
    custom_category?: string | null;
    expense_date: string;
    description: string | null;
  }): Promise<{ success: boolean; error?: string }> => {
    if (configured && user) {
      try {
        const { error: insertErr } = await supabase
          .from('expenses')
          .insert({
            user_id: user.id,
            amount: data.amount,
            category: data.category,
            custom_category: data.custom_category || null,
            expense_date: data.expense_date,
            description: data.description,
          });

        if (insertErr) throw insertErr;

        await fetchExpensesAndLimits();
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to create expense';
        return { success: false, error: msg };
      }
    } else {
      // Local fallback
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        user_id: 'local-user',
        amount: data.amount,
        category: data.category,
        custom_category: data.custom_category || null,
        description: data.description,
        expense_date: data.expense_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newExpense, ...expenses];
      setExpenses(updated);
      localStorage.setItem('lucifer_expenses', JSON.stringify(updated));
      return { success: true };
    }
  };

  // Update Expense
  const updateExpense = async (
    id: string,
    data: {
      amount: number;
      category: ExpenseCategory;
      custom_category?: string | null;
      expense_date: string;
      description: string | null;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    if (configured && user) {
      try {
        const { error: updateErr } = await supabase
          .from('expenses')
          .update({
            amount: data.amount,
            category: data.category,
            custom_category: data.custom_category || null,
            expense_date: data.expense_date,
            description: data.description,
          })
          .eq('id', id);

        if (updateErr) throw updateErr;

        await fetchExpensesAndLimits();
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update expense';
        return { success: false, error: msg };
      }
    } else {
      // Local fallback
      const updated = expenses.map((item) =>
        item.id === id
          ? {
              ...item,
              amount: data.amount,
              category: data.category,
              custom_category: data.custom_category || null,
              expense_date: data.expense_date,
              description: data.description,
              updated_at: new Date().toISOString(),
            }
          : item
      );
      setExpenses(updated);
      localStorage.setItem('lucifer_expenses', JSON.stringify(updated));
      return { success: true };
    }
  };

  // Delete Expense
  const deleteExpense = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (configured && user) {
      try {
        const { error: delErr } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id);

        if (delErr) throw delErr;

        await fetchExpensesAndLimits();
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to delete expense';
        return { success: false, error: msg };
      }
    } else {
      // Local fallback
      const updated = expenses.filter((e) => e.id !== id);
      setExpenses(updated);
      localStorage.setItem('lucifer_expenses', JSON.stringify(updated));
      return { success: true };
    }
  };

  // Compute month bounds for the currently selected month
  const { monthStart, nextMonthStart } = useMemo(
    () => getMonthBounds(activeYear, activeMonth),
    [activeYear, activeMonth]
  );

  // Month-filtered expenses
  const monthExpenses = useMemo(() => {
    return expenses.filter(
      (e) => e.expense_date >= monthStart && e.expense_date < nextMonthStart
    );
  }, [expenses, monthStart, nextMonthStart]);

  // Aggregated calculations
  const monthlyTotal = useMemo(() => calculateTotal(monthExpenses), [monthExpenses]);
  const transactionCount = monthExpenses.length;
  const categoryBreakdown = useMemo(() => calculateCategoryBreakdown(monthExpenses), [monthExpenses]);
  const monthlyTrends = useMemo(
    () => calculateMonthlyTrends(expenses, 6, activeYear, activeMonth),
    [expenses, activeYear, activeMonth]
  );

  // Active Month Limit and Calculations
  const currentKey = `${activeYear}-${activeMonth}`;
  const monthlyLimit: number | null = limitsMap[currentKey] !== undefined ? limitsMap[currentKey] : null;
  const remainingBalance: number | null = monthlyLimit !== null ? monthlyLimit - monthlyTotal : null;
  const percentUsed: number | null =
    monthlyLimit !== null && monthlyLimit > 0 ? (monthlyTotal / monthlyLimit) * 100 : null;
  const isOverLimit: boolean = monthlyLimit !== null && monthlyTotal > monthlyLimit;

  return {
    allExpenses: expenses,
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
    refreshExpenses: fetchExpensesAndLimits,
  };
}
