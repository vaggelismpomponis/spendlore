-- Migration: Create cooling_off_items table with Row Level Security (RLS)
-- Ensures 72-hour cooling-off wishlist items are strictly personal per user account and synced across devices.

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

-- Indexes for lightning fast queries and user isolation
CREATE INDEX IF NOT EXISTS idx_cooling_off_items_user_id ON public.cooling_off_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cooling_off_items_status ON public.cooling_off_items(status);
CREATE INDEX IF NOT EXISTS idx_cooling_off_items_expires_at ON public.cooling_off_items(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cooling_off_items ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Authenticated users can view, insert, update, and delete ONLY their own items
DROP POLICY IF EXISTS "Users can manage own cooling_off_items" ON public.cooling_off_items;
CREATE POLICY "Users can manage own cooling_off_items"
    ON public.cooling_off_items
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Policy: Admin read access
DROP POLICY IF EXISTS "Admins can view all cooling_off_items" ON public.cooling_off_items;
CREATE POLICY "Admins can view all cooling_off_items"
    ON public.cooling_off_items
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR (auth.jwt() ->> 'email') IN (
            'vaggelisbobonhs@gmail.com',
            'vaggelismpomponis@gmail.com',
            'ebomponis@gmail.com'
        )
    );

