import { supabase } from '../supabase';

const STORAGE_KEY = 'spendlore_sentry_errors';
const MAX_LOCAL_LOGS = 150;

class SentryLogger {
    constructor() {
        this.memoryLogs = [];
        this.loadLocalLogs();
    }

    loadLocalLogs() {
        if (typeof window === 'undefined') return;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    this.memoryLogs = parsed;
                }
            }
        } catch (e) {
            this.memoryLogs = [];
        }
    }

    saveLocalLogs() {
        if (typeof window === 'undefined') return;
        try {
            const trimmed = this.memoryLogs.slice(0, MAX_LOCAL_LOGS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        } catch (e) {
            // Ignore storage quota or restricted environment errors
        }
    }

    /**
     * Record a new Sentry / Application error log
     */
    recordError({
        message,
        error = null,
        context = 'App',
        level = 'error',
        extras = null,
        sentryEventId = null,
        stack = null
    }) {
        try {
            const errStr = error
                ? (error instanceof Error
                    ? (error.message || String(error))
                    : (typeof error === 'object' ? JSON.stringify(error) : String(error)))
                : '';

            const errorStack = stack || (error instanceof Error ? error.stack : null) || (new Error().stack || '');
            const finalMessage = message 
                ? (errStr && !message.includes(errStr) ? `${message}: ${errStr}` : message) 
                : (errStr || 'Unknown Error');

            let userEmail = null;
            let userId = null;
            if (typeof window !== 'undefined') {
                try {
                    const sessionRaw = localStorage.getItem('sb-session');
                    if (sessionRaw) {
                        const parsed = JSON.parse(sessionRaw);
                        userEmail = parsed?.user?.email || null;
                        userId = parsed?.user?.id || null;
                    }
                } catch (e) {}
            }

            const logEntry = {
                id: sentryEventId || `sentry_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                timestamp: new Date().toISOString(),
                message: finalMessage,
                level: (level || 'error').toLowerCase(),
                context: context || 'General',
                stack: errorStack,
                url: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                userId,
                userEmail,
                extras: extras || null,
                sentryEventId: sentryEventId || null
            };

            // Deduplicate if identical error arrives within 1.5 seconds
            const isDuplicate = this.memoryLogs.length > 0 &&
                this.memoryLogs[0].message === logEntry.message &&
                Math.abs(new Date(this.memoryLogs[0].timestamp).getTime() - new Date(logEntry.timestamp).getTime()) < 1500;

            if (!isDuplicate) {
                this.memoryLogs = [logEntry, ...this.memoryLogs].slice(0, MAX_LOCAL_LOGS);
                this.saveLocalLogs();

                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('spendlore:sentry-error-recorded', { detail: logEntry }));
                }

                // Asynchronously attempt sync to cloud table (if available)
                this.syncToCloud(logEntry);
            }

            return logEntry;
        } catch (e) {
            console.warn('[SentryLogger] Error recording log entry:', e);
            return null;
        }
    }

    async syncToCloud(logEntry) {
        if (!supabase) return;
        try {
            await supabase.from('sentry_errors').insert([{
                event_id: logEntry.id,
                message: logEntry.message,
                level: logEntry.level,
                context: logEntry.context,
                stack: logEntry.stack,
                url: logEntry.url,
                user_email: logEntry.userEmail,
                user_id: logEntry.userId,
                metadata: logEntry.extras,
                created_at: logEntry.timestamp
            }]);
        } catch (e) {
            // Silently ignore if table doesn't exist or RLS prohibits
        }
    }

    /**
     * Retrieve all error logs (merging cloud logs if available with local logs)
     */
    async fetchAllErrors() {
        this.loadLocalLogs();
        let cloudErrors = [];

        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('sentry_errors')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (!error && Array.isArray(data)) {
                    cloudErrors = data.map(item => ({
                        id: item.event_id || item.id,
                        timestamp: item.created_at,
                        message: item.message,
                        level: item.level || 'error',
                        context: item.context || 'General',
                        stack: item.stack,
                        url: item.url || '',
                        userEmail: item.user_email || null,
                        userId: item.user_id || null,
                        extras: item.metadata || null,
                        isCloudSynced: true
                    }));
                }
            } catch (e) {
                // Table doesn't exist or offline — fallback to local logs
            }
        }

        // Merge deduplicated by id or event_id
        const mergedMap = new Map();
        [...cloudErrors, ...this.memoryLogs].forEach(item => {
            if (item && item.id && !mergedMap.has(item.id)) {
                mergedMap.set(item.id, item);
            }
        });

        const sorted = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return sorted;
    }

    /**
     * Clear all recorded errors locally and in cloud
     */
    async clearErrors() {
        this.memoryLogs = [];
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) {}
        }

        if (supabase) {
            try {
                await supabase.from('sentry_errors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            } catch (e) {}
        }

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('spendlore:sentry-error-cleared'));
        }
    }
}

export const sentryLogger = new SentryLogger();
export default sentryLogger;

