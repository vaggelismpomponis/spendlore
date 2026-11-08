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
