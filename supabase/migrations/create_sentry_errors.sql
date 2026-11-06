-- Migration: Create sentry_errors table for admin error telemetry
-- Run this in Supabase SQL Editor to enable cloud-wide error logging across all users and devices.

CREATE TABLE IF NOT EXISTS public.sentry_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT,
    message TEXT NOT NULL,
    level TEXT DEFAULT 'error',
    context TEXT DEFAULT 'General',
    stack TEXT,
    url TEXT,
    user_email TEXT,
    user_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_sentry_errors_created_at ON public.sentry_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sentry_errors_level ON public.sentry_errors(level);

-- Enable RLS
ALTER TABLE public.sentry_errors ENABLE ROW LEVEL SECURITY;

-- 1. Allow any client / user to insert telemetry errors
DROP POLICY IF EXISTS "Allow public insert to sentry_errors" ON public.sentry_errors;
CREATE POLICY "Allow public insert to sentry_errors"
    ON public.sentry_errors
    FOR INSERT
    TO public
    WITH CHECK (true);

-- 2. Allow authorized admins to read all error logs
DROP POLICY IF EXISTS "Allow admin read access to sentry_errors" ON public.sentry_errors;
CREATE POLICY "Allow admin read access to sentry_errors"
    ON public.sentry_errors
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR (auth.jwt() ->> 'email') IN (
            'vaggelisbobonhs@gmail.com',
            'vaggelismpomponis@gmail.com',
            'ebomponis@gmail.com'
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.email IN (
                'vaggelisbobonhs@gmail.com',
                'vaggelismpomponis@gmail.com',
                'ebomponis@gmail.com'
            )
        )
    );

-- 3. Allow authorized admins to purge/delete error logs
DROP POLICY IF EXISTS "Allow admin delete access to sentry_errors" ON public.sentry_errors;
CREATE POLICY "Allow admin delete access to sentry_errors"
    ON public.sentry_errors
    FOR DELETE
    TO authenticated
    USING (
        public.is_admin()
        OR (auth.jwt() ->> 'email') IN (
            'vaggelisbobonhs@gmail.com',
            'vaggelismpomponis@gmail.com',
            'ebomponis@gmail.com'
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.email IN (
                'vaggelisbobonhs@gmail.com',
                'vaggelismpomponis@gmail.com',
                'ebomponis@gmail.com'
            )
        )
    );
