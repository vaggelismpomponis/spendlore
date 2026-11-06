-- Migration: RPC Function for Admin User Deletion
-- Run this in Supabase SQL Editor to allow administrators to permanently purge a user account and their records.

CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    caller_id uuid;
    caller_email text;
BEGIN
    caller_id := auth.uid();
    caller_email := auth.jwt() ->> 'email';

    -- 1. Security Check: Only Master Admin can execute this function
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Master Admin privilege required';
    END IF;

    -- 2. Guard: Prevent self-deletion of Admin accounts
    IF target_user_id = caller_id THEN
        RAISE EXCEPTION 'Cannot delete your own admin account';
    END IF;

    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = target_user_id 
        AND LOWER(COALESCE(email, '')) IN (
            'vaggelisbobonhs@gmail.com', 
            'vaggelismpomponis@gmail.com', 
            'ebomponis@gmail.com'
        )
    ) THEN
        RAISE EXCEPTION 'Cannot delete master admin account';
    END IF;

    -- 3. Delete user data across all tables
    DELETE FROM public.transactions WHERE user_id = target_user_id;
    DELETE FROM public.recurring_transactions WHERE user_id = target_user_id;
    DELETE FROM public.goals WHERE user_id = target_user_id;
    DELETE FROM public.budgets WHERE user_id = target_user_id;
    DELETE FROM public.sessions WHERE user_id = target_user_id;
    DELETE FROM public.feedback WHERE user_id = target_user_id;
    DELETE FROM public.sentry_errors WHERE user_id = target_user_id;
    DELETE FROM public.profiles WHERE id = target_user_id;

    -- 4. Delete user record from auth.users
    DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- Ensure ownership and execution grants
ALTER FUNCTION public.admin_delete_user(uuid) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;

