-- Migration: Push Notifications infrastructure (subscriptions, preferences, delivery logs)
-- Supports Android Native (FCM) and Web/PWA (VAPID) with account-level cloud sync and RLS.

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('web', 'android', 'ios')),
    device_key TEXT NOT NULL,
    token TEXT,
    endpoint TEXT,
    p256dh TEXT,
    auth TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_seen_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, device_key)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active ON public.push_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_platform ON public.push_subscriptions(platform);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage own push_subscriptions"
    ON public.push_subscriptions
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admins can view all push_subscriptions"
    ON public.push_subscriptions
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

CREATE TABLE IF NOT EXISTS public.push_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT false NOT NULL,
    prompt_answered BOOLEAN DEFAULT false NOT NULL,
    prompt_answered_at TIMESTAMPTZ,
    evening_reminder_enabled BOOLEAN DEFAULT true NOT NULL,
    evening_reminder_hour SMALLINT DEFAULT 21 NOT NULL CHECK (evening_reminder_hour BETWEEN 17 AND 23),
    midday_nudge_enabled BOOLEAN DEFAULT true NOT NULL,
    midday_nudge_hour SMALLINT DEFAULT 14 NOT NULL CHECK (midday_nudge_hour BETWEEN 11 AND 17),
    weekly_summary_enabled BOOLEAN DEFAULT true NOT NULL,
    weekly_summary_hour SMALLINT DEFAULT 18 NOT NULL CHECK (weekly_summary_hour BETWEEN 10 AND 22),
    timezone TEXT DEFAULT 'Europe/Athens' NOT NULL,
    language TEXT DEFAULT 'el' NOT NULL CHECK (language IN ('el', 'en')),
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.push_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own push_preferences" ON public.push_preferences;
CREATE POLICY "Users can manage own push_preferences"
    ON public.push_preferences
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all push_preferences" ON public.push_preferences;
CREATE POLICY "Admins can view all push_preferences"
    ON public.push_preferences
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

CREATE TABLE IF NOT EXISTS public.push_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('evening_reminder', 'midday_nudge', 'weekly_summary', 'admin_broadcast')),
    period_key TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, notification_type, period_key)
);

CREATE INDEX IF NOT EXISTS idx_push_delivery_logs_user_sent_at ON public.push_delivery_logs(user_id, sent_at DESC);

ALTER TABLE public.push_delivery_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own push_delivery_logs" ON public.push_delivery_logs;
CREATE POLICY "Users can view own push_delivery_logs"
    ON public.push_delivery_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all push_delivery_logs" ON public.push_delivery_logs;
CREATE POLICY "Admins can view all push_delivery_logs"
    ON public.push_delivery_logs
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
