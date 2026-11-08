import { useAppStore } from '../store/useAppStore';
import logger from '../utils/logger';

/**
 * Checks if an error or browser state corresponds to an offline/network failure
 */
export const isNetworkError = (error) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return true;
    }
    if (!error) return false;
    const msg = String(error.message || error.statusText || error).toLowerCase();
    return (
        msg.includes('failed to fetch') ||
        msg.includes('networkerror') ||
        msg.includes('network request failed') ||
        msg.includes('network error') ||
        msg.includes('offline') ||
        msg.includes('abort') ||
        msg.includes('timeout') ||
        msg.includes('load failed') ||
        error.status === 0 ||
        error.code === 'ECONNABORTED'
    );
};

/**
 * Sequential processor for offline mutation queue
 */
export const processSyncQueue = async (supabase, user, options = {}) => {
    if (!supabase || !user?.id) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    const store = useAppStore.getState();
    if (store.isSyncing) return;

    const queue = store.syncQueue || [];
    if (queue.length === 0) return;

    store.setIsSyncing(true);
    let drainedCount = 0;

    try {
        for (const item of [...queue]) {
            // Re-check online status between items
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                break;
            }

            try {
                if (item.action === 'insert') {
                    let { data, error } = await supabase
                        .from(item.entity || 'transactions')
                        .insert(item.payload)
                        .select();

                    // Handle session expiration during sync
                    if (error && (error.code === '42501' || error.message?.includes('JWT') || error.message?.includes('security policy'))) {
                        const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
                        if (!refreshErr && refreshData?.session?.user) {
                            const refreshedUserId = refreshData.session.user.id;
                            const retryRes = await supabase
                                .from(item.entity || 'transactions')
                                .insert({ ...item.payload, user_id: refreshedUserId })
                                .select();
                            data = retryRes.data;
                            error = retryRes.error;
                        }
                    }

                    if (error && (error.code === 'PGRST204' || error.message?.includes('splits'))) {
                        const { splits: _omit, ...fallbackPayload } = item.payload;
                        const retryRes = await supabase
                            .from(item.entity || 'transactions')
                            .insert(fallbackPayload)
                            .select();
                        data = retryRes.data;
                        error = retryRes.error;
                    }

                    if (error) {
                        if (isNetworkError(error)) {
                            logger.warn('Network error during sync insert, halting queue', 'SyncService');
                            break;
                        }
                        const retries = (item.retryCount || 0) + 1;
                        if (retries >= 3) {
                            logger.error(`Permanent sync error on item ${item.id}`, error, 'SyncService');
                            store.removeFromSyncQueue(item.id);
                        } else {
                            store.updateSyncQueueItem(item.id, { retryCount: retries });
                        }
                        continue;
                    }

                    const insertedRow = Array.isArray(data) ? data[0] : data;
                    const realId = insertedRow?.id;

                    // Update optimistic item in local store with server ID and mark synced
                    if (item.localId && realId) {
                        useAppStore.setState((state) => ({
                            transactions: state.transactions.map((t) =>
                                t.id === item.localId ? { ...t, id: realId, _is_offline: false } : t
                            )
                        }));
                    }

                    store.removeFromSyncQueue(item.id);
                    drainedCount++;
                } else if (item.action === 'update') {
                    let { error } = await supabase
                        .from(item.entity || 'transactions')
                        .update(item.payload)
                        .eq('id', item.targetId);

                    if (error && (error.code === '42501' || error.message?.includes('JWT') || error.message?.includes('security policy'))) {
                        const { error: refreshErr } = await supabase.auth.refreshSession();
                        if (!refreshErr) {
                            const retryRes = await supabase
                                .from(item.entity || 'transactions')
                                .update(item.payload)
                                .eq('id', item.targetId);
                            error = retryRes.error;
                        }
                    }

                    if (error && (error.code === 'PGRST204' || error.message?.includes('splits'))) {
                        const { splits: _omit, ...fallbackPayload } = item.payload;
                        const retryRes = await supabase
                            .from(item.entity || 'transactions')
                            .update(fallbackPayload)
                            .eq('id', item.targetId);
                        error = retryRes.error;
                    }

                    if (error) {
                        if (isNetworkError(error)) {
                            logger.warn('Network error during sync update, halting queue', 'SyncService');
                            break;
                        }
                        const retries = (item.retryCount || 0) + 1;
                        if (retries >= 3) {
                            logger.error(`Permanent sync update error on item ${item.id}`, error, 'SyncService');
                            store.removeFromSyncQueue(item.id);
                        } else {
                            store.updateSyncQueueItem(item.id, { retryCount: retries });
                        }
                        continue;
                    }

                    // Remove offline flag from local item
                    useAppStore.setState((state) => ({
                        transactions: state.transactions.map((t) =>
                            t.id === item.targetId ? { ...t, _is_offline: false } : t
                        )
                    }));

                    store.removeFromSyncQueue(item.id);
                    drainedCount++;
                } else if (item.action === 'delete') {
                    let { error } = await supabase
                        .from(item.entity || 'transactions')
                        .delete()
                        .eq('id', item.targetId);

                    if (error && (error.code === '42501' || error.message?.includes('JWT') || error.message?.includes('security policy'))) {
                        const { error: refreshErr } = await supabase.auth.refreshSession();
                        if (!refreshErr) {
                            const retryRes = await supabase
                                .from(item.entity || 'transactions')
                                .delete()
                                .eq('id', item.targetId);
                            error = retryRes.error;
                        }
                    }

                    if (error) {
                        if (isNetworkError(error)) {
                            logger.warn('Network error during sync delete, halting queue', 'SyncService');
                            break;
                        }
                        logger.error(`Sync delete error on item ${item.id}`, error, 'SyncService');
                        store.removeFromSyncQueue(item.id);
                        continue;
                    }

                    store.removeFromSyncQueue(item.id);
                    drainedCount++;
                }
            } catch (err) {
                if (isNetworkError(err)) {
                    logger.warn('Network failure during sync step, halting queue', 'SyncService');
                    break;
                }
                logger.error('Unexpected error during sync item processing', err, 'SyncService');
            }
        }
    } finally {
        const remainingQueue = useAppStore.getState().syncQueue || [];
        useAppStore.getState().setIsSyncing(false);
        useAppStore.getState().setLastSyncedAt(new Date().toISOString());

        if (drainedCount > 0 && remainingQueue.length === 0) {
            options.onQueueDrained?.(drainedCount);
        }
    }
};

/**
 * Initializes listeners for online/offline events
 */
export const initSyncListeners = (supabase, getUser, options = {}) => {
    if (typeof window === 'undefined') return () => { };

    const handleOnline = () => {
        useAppStore.getState().setIsOnline(true);
        const user = getUser?.();
        if (user?.id) {
            processSyncQueue(supabase, user, options);
        }
    };

    const handleOffline = () => {
        useAppStore.getState().setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on mount
    if (navigator.onLine) {
        useAppStore.getState().setIsOnline(true);
        const user = getUser?.();
        if (user?.id) {
            processSyncQueue(supabase, user, options);
        }
    } else {
        useAppStore.getState().setIsOnline(false);
    }

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
};

export default {
    isNetworkError,
    processSyncQueue,
    initSyncListeners,
};

