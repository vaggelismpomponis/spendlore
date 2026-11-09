-- Ensure profiles table has all required columns for the admin dashboard
DO $$
BEGIN
    -- Add stripe_customer_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'stripe_customer_id') THEN
        ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;
    END IF;

    -- Add admin_notes if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'admin_notes') THEN
        ALTER TABLE public.profiles ADD COLUMN admin_notes TEXT;
    END IF;

    -- Add ticketing columns to feedback table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'feedback' AND COLUMN_NAME = 'status') THEN
        ALTER TABLE public.feedback ADD COLUMN status TEXT DEFAULT 'open';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'feedback' AND COLUMN_NAME = 'priority') THEN
        ALTER TABLE public.feedback ADD COLUMN priority TEXT DEFAULT 'normal';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'feedback' AND COLUMN_NAME = 'admin_notes') THEN
        ALTER TABLE public.feedback ADD COLUMN admin_notes TEXT;
    END IF;

    -- Add splits column to transactions table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'transactions' AND COLUMN_NAME = 'splits') THEN
        ALTER TABLE public.transactions ADD COLUMN splits JSONB;
    END IF;
END $$;

-- Ensure cooling_off_items table exists with RLS for personal 72-hour rules
CREATE TABLE IF NOT EXISTS public.cooling_off_items (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT DEFAULT 'Άλλο',
    note TEXT DEFAULT '',
    duration_hours INT DEFAULT 72,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'passed', 'bought')),
    decided_at TIMESTAMPTZ,
    saved_amount NUMERIC DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_cooling_off_items_user_id ON public.cooling_off_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cooling_off_items_status ON public.cooling_off_items(status);
CREATE INDEX IF NOT EXISTS idx_cooling_off_items_expires_at ON public.cooling_off_items(expires_at);

ALTER TABLE public.cooling_off_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cooling_off_items" ON public.cooling_off_items;
CREATE POLICY "Users can manage own cooling_off_items"
    ON public.cooling_off_items
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

