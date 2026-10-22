-- ==============================================================================
-- Migration: 001_create_expenses.sql
-- Project: Lucifer Tracker (Personal Monthly Expense Tracker)
-- Description: Creates the public.expenses table, public.monthly_limits table,
--              Row Level Security policies, indexes, and automatic updated_at triggers.
-- Database: Supabase PostgreSQL
-- ==============================================================================

-- 1. Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    category TEXT NOT NULL,
    custom_category TEXT,
    description TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_expense_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_expense_category CHECK (
        category IN (
            'Food',
            'Transportation',
            'Shopping',
            'Education',
            'Entertainment',
            'Other'
        )
    ),
    CONSTRAINT chk_expense_description_length CHECK (
        description IS NULL OR char_length(description) <= 500
    )
);

-- 2. Create index for efficient history querying and monthly date-range reporting
CREATE INDEX IF NOT EXISTS idx_expenses_user_id_expense_date_desc
    ON public.expenses (user_id, expense_date DESC);

-- 3. Enable Row Level Security (RLS) on expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 4. SELECT policy: authenticated users can only view their own expense records
DROP POLICY IF EXISTS "Users can read own expenses" ON public.expenses;
CREATE POLICY "Users can read own expenses"
    ON public.expenses
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. INSERT policy: authenticated users can only insert records assigned to their own user_id
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
CREATE POLICY "Users can insert own expenses"
    ON public.expenses
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 6. UPDATE policy: authenticated users can update only their own existing records and cannot reassign ownership
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
CREATE POLICY "Users can update own expenses"
    ON public.expenses
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. DELETE policy: authenticated users can delete only their own records
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can delete own expenses"
    ON public.expenses
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 8. Auto-update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_expenses_updated_at ON public.expenses;
CREATE TRIGGER trg_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 9. Create monthly_limits table for optional monthly budget limits
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.monthly_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    limit_amount NUMERIC(12, 2) NOT NULL CHECK (limit_amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_monthly_limits_user_year_month UNIQUE (user_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_limits_user_date
    ON public.monthly_limits (user_id, year, month);

ALTER TABLE public.monthly_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own monthly limits" ON public.monthly_limits;
CREATE POLICY "Users can read own monthly limits"
    ON public.monthly_limits
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own monthly limits" ON public.monthly_limits;
CREATE POLICY "Users can insert own monthly limits"
    ON public.monthly_limits
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own monthly limits" ON public.monthly_limits;
CREATE POLICY "Users can update own monthly limits"
    ON public.monthly_limits
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own monthly limits" ON public.monthly_limits;
CREATE POLICY "Users can delete own monthly limits"
    ON public.monthly_limits
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_monthly_limits_updated_at ON public.monthly_limits;
CREATE TRIGGER trg_monthly_limits_updated_at
    BEFORE UPDATE ON public.monthly_limits
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.expenses IS 'Lucifer Tracker expenses table with RLS enforcing authenticated ownership.';
COMMENT ON TABLE public.monthly_limits IS 'Lucifer Tracker monthly spending limits with RLS.';
