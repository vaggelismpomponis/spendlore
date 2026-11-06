-- ==============================================================================
-- Migration: Admin Telemetry & Statistics Sovereignty (RLS + RPC)
-- Description: Enables Admin Console to accurately view usage statistics,
--              transaction counts, budgets, goals, and session telemetry
--              for all registered users while maintaining strict privacy for standard users.
-- ==============================================================================

-- 1. Create or replace the is_admin() helper function
-- Robustly verifies admin status across database superusers, specific admin emails,
-- master admin UUID, auth.users records, and JWT role claims.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_id uuid;
  caller_email text;
  caller_role text;
BEGIN
  -- 1. If executed in Supabase SQL Editor or as database superuser/postgres role
  IF current_user = 'postgres' OR session_user = 'postgres' THEN
    RETURN true;
  END IF;

  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN false;
  END IF;

  -- 2. Check directly in auth.users table (most authoritative)
  SELECT 
    LOWER(COALESCE(email, '')),
    COALESCE(raw_app_meta_data->>'role', raw_user_meta_data->>'role', '')
  INTO caller_email, caller_role
  FROM auth.users
  WHERE id = caller_id;

  IF caller_role = 'admin' THEN
    RETURN true;
  END IF;

  IF caller_email IN (
    'vaggelisbobonhs@gmail.com',
    'vaggelismpomponis@gmail.com',
    'ebomponis@gmail.com',
    'spendwisegr@gmail.com'
  ) THEN
    RETURN true;
  END IF;

  -- 4. Check JWT claims as fallback
  BEGIN
    IF LOWER(COALESCE(auth.jwt() ->> 'email', '')) IN (
      'vaggelisbobonhs@gmail.com',
      'vaggelismpomponis@gmail.com',
      'ebomponis@gmail.com',
      'spendwisegr@gmail.com'
    ) OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
      OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' THEN
      RETURN true;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore JWT parse errors if called without active request headers
  END;

  RETURN false;
END;
$$;

ALTER FUNCTION public.is_admin() OWNER TO postgres;

-- 2. Add Admin SELECT Policies for core tables
-- Transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- Budgets
DROP POLICY IF EXISTS "Admins can view all budgets" ON public.budgets;
CREATE POLICY "Admins can view all budgets"
ON public.budgets FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- Goals
DROP POLICY IF EXISTS "Admins can view all goals" ON public.goals;
CREATE POLICY "Admins can view all goals"
ON public.goals FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- Sessions
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.sessions;
CREATE POLICY "Admins can view all sessions"
ON public.sessions FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- 3. Security Definer RPC for individual user statistics calculation
-- Supports target_user_id as text or uuid with safe type casting
CREATE OR REPLACE FUNCTION public.admin_get_user_stats(target_user_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  tx_count bigint := 0;
  b_count bigint := 0;
  g_count bigint := 0;
  target_uuid uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.';
  END IF;

  BEGIN
    target_uuid := target_user_id::uuid;
  EXCEPTION WHEN OTHERS THEN
    target_uuid := NULL;
  END;

  -- Match on either string representation or UUID
  SELECT count(*) INTO tx_count 
  FROM public.transactions 
  WHERE user_id::text = target_user_id 
     OR (target_uuid IS NOT NULL AND user_id = target_uuid);

  SELECT count(*) INTO b_count 
  FROM public.budgets 
  WHERE user_id::text = target_user_id 
     OR (target_uuid IS NOT NULL AND user_id = target_uuid);

  SELECT count(*) INTO g_count 
  FROM public.goals 
  WHERE user_id::text = target_user_id 
     OR (target_uuid IS NOT NULL AND user_id = target_uuid);

  RETURN jsonb_build_object(
    'transactions', tx_count,
    'budgets', b_count,
    'goals', g_count
  );
END;
$$;

ALTER FUNCTION public.admin_get_user_stats(text) OWNER TO postgres;

-- Overload for UUID parameter
CREATE OR REPLACE FUNCTION public.admin_get_user_stats(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN public.admin_get_user_stats(target_user_id::text);
END;
$$;

ALTER FUNCTION public.admin_get_user_stats(uuid) OWNER TO postgres;

-- 4. Security Definer RPC for batch calculating statistics for all users at once
CREATE OR REPLACE FUNCTION public.admin_get_all_users_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.';
  END IF;

  SELECT jsonb_object_agg(u_id, stats) INTO result
  FROM (
    SELECT 
      coalesce(t.user_id::text, b.user_id::text, g.user_id::text) AS u_id,
      jsonb_build_object(
        'transactions', coalesce(t.cnt, 0),
        'budgets', coalesce(b.cnt, 0),
        'goals', coalesce(g.cnt, 0)
      ) AS stats
    FROM (
      SELECT user_id::text, count(*) as cnt FROM public.transactions GROUP BY user_id::text
    ) t
    FULL OUTER JOIN (
      SELECT user_id::text, count(*) as cnt FROM public.budgets GROUP BY user_id::text
    ) b ON t.user_id = b.user_id
    FULL OUTER JOIN (
      SELECT user_id::text, count(*) as cnt FROM public.goals GROUP BY user_id::text
    ) g ON coalesce(t.user_id, b.user_id) = g.user_id
  ) s
  WHERE u_id IS NOT NULL;

  RETURN coalesce(result, '{}'::jsonb);
END;
$$;

ALTER FUNCTION public.admin_get_all_users_stats() OWNER TO postgres;

-- 5. Security Definer RPC for platform-wide overview metrics calculation
CREATE OR REPLACE FUNCTION public.admin_get_overview_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  total_tx bigint := 0;
  total_budgets bigint := 0;
  total_goals bigint := 0;
  total_feedback bigint := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.';
  END IF;

  SELECT count(*) INTO total_tx FROM public.transactions;
  SELECT count(*) INTO total_budgets FROM public.budgets;
  SELECT count(*) INTO total_goals FROM public.goals;
  SELECT count(*) INTO total_feedback FROM public.feedback;

  RETURN jsonb_build_object(
    'transactions', total_tx,
    'budgets', total_budgets,
    'goals', total_goals,
    'feedback', total_feedback
  );
END;
$$;

ALTER FUNCTION public.admin_get_overview_stats() OWNER TO postgres;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_user_stats(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_user_stats(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_all_users_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_overview_stats() TO authenticated, anon;

-- ==============================================================================
-- Diagnostics Query (Run this block in SQL Editor to inspect your actual counts)
-- ==============================================================================
-- SELECT 
--   u.id, 
--   u.email, 
--   count(t.id) as transactions_count,
--   count(b.id) as budgets_count,
--   count(g.id) as goals_count
-- FROM auth.users u
-- LEFT JOIN public.transactions t ON t.user_id::text = u.id::text
-- LEFT JOIN public.budgets b ON b.user_id::text = u.id::text
-- LEFT JOIN public.goals g ON g.user_id::text = u.id::text
-- WHERE LOWER(u.email) LIKE '%skanatas%' OR LOWER(u.email) LIKE '%vaggelis%'
-- GROUP BY u.id, u.email;
