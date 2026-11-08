import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isNetworkError, processSyncQueue, initSyncListeners } from '../SyncService';
import { useAppStore } from '../../store/useAppStore';

describe('SyncService', () => {
    beforeEach(() => {
        useAppStore.setState({
            transactions: [],
            syncQueue: [],
            isOnline: true,
            isSyncing: false,
            lastSyncedAt: null,
        });
        vi.clearAllMocks();
    });

    describe('isNetworkError', () => {
        it('returns true when navigator is offline', () => {
            const originalOnLine = navigator.onLine;
            Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

            expect(isNetworkError(new Error('Any error'))).toBe(true);

            Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
        });

        it('detects network-related error messages', () => {
            expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true);
            expect(isNetworkError(new Error('NetworkError when attempting to fetch resource.'))).toBe(true);
            expect(isNetworkError(new Error('Connection timeout'))).toBe(true);
            expect(isNetworkError({ status: 0 })).toBe(true);
            expect(isNetworkError({ code: 'ECONNABORTED' })).toBe(true);
        });

        it('returns false for regular application/Postgres errors', () => {
            expect(isNetworkError(new Error('Row level security policy violated'))).toBe(false);
            expect(isNetworkError({ code: '42501', message: 'permission denied' })).toBe(false);
            expect(isNetworkError(null)).toBe(false);
        });
    });

    describe('processSyncQueue', () => {
        it('processes insert mutations, updates local store transaction id, and drains queue', async () => {
            const localId = 'local_tx_123';
            useAppStore.setState({
                transactions: [
                    { id: localId, amount: 25, category: 'food', type: 'expense', _is_offline: true }
                ],
                syncQueue: [
                    {
                        id: 'queue_1',
                        entity: 'transactions',
                        action: 'insert',
                        localId,
                        payload: { amount: 25, category: 'food', type: 'expense', user_id: 'user_1' }
                    }
                ]
            });

            const mockSupabase = {
                from: vi.fn(() => ({
                    insert: vi.fn(() => ({
                        select: vi.fn().mockResolvedValue({
                            data: [{ id: 'server_tx_999', amount: 25 }],
                            error: null
                        })
                    }))
                }))
            };

            const user = { id: 'user_1' };
            const onQueueDrained = vi.fn();

            await processSyncQueue(mockSupabase, user, { onQueueDrained });

            const state = useAppStore.getState();
            expect(state.syncQueue).toHaveLength(0);
            expect(state.transactions[0].id).toBe('server_tx_999');
            expect(state.transactions[0]._is_offline).toBe(false);
            expect(onQueueDrained).toHaveBeenCalledWith(1);
            expect(state.isSyncing).toBe(false);
        });

        it('processes update mutations and removes them from queue', async () => {
            useAppStore.setState({
                transactions: [
                    { id: 'tx_1', amount: 15, category: 'coffee', _is_offline: true }
                ],
                syncQueue: [
                    {
                        id: 'queue_2',
                        entity: 'transactions',
                        action: 'update',
                        targetId: 'tx_1',
                        payload: { amount: 20 }
                    }
                ]
            });

            const mockEq = vi.fn().mockResolvedValue({ error: null });
            const mockUpdate = vi.fn(() => ({ eq: mockEq }));
            const mockSupabase = {
                from: vi.fn(() => ({ update: mockUpdate }))
            };

            const user = { id: 'user_1' };
            await processSyncQueue(mockSupabase, user);

            const state = useAppStore.getState();
            expect(state.syncQueue).toHaveLength(0);
            expect(state.transactions[0]._is_offline).toBe(false);
            expect(mockUpdate).toHaveBeenCalledWith({ amount: 20 });
            expect(mockEq).toHaveBeenCalledWith('id', 'tx_1');
        });

        it('processes delete mutations and removes them from queue', async () => {
            useAppStore.setState({
                syncQueue: [
                    {
                        id: 'queue_3',
                        entity: 'transactions',
                        action: 'delete',
                        targetId: 'tx_old'
                    }
                ]
            });

            const mockEq = vi.fn().mockResolvedValue({ error: null });
            const mockDelete = vi.fn(() => ({ eq: mockEq }));
            const mockSupabase = {
                from: vi.fn(() => ({ delete: mockDelete }))
            };

            const user = { id: 'user_1' };
            await processSyncQueue(mockSupabase, user);

            const state = useAppStore.getState();
            expect(state.syncQueue).toHaveLength(0);
            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', 'tx_old');
        });

        it('halts queue processing when encountering a network error without losing queue items', async () => {
            useAppStore.setState({
                syncQueue: [
                    {
                        id: 'queue_net_fail',
                        entity: 'transactions',
                        action: 'insert',
                        payload: { amount: 50 }
                    },
                    {
                        id: 'queue_waiting',
                        entity: 'transactions',
                        action: 'delete',
                        targetId: 'tx_waiting'
                    }
                ]
            });

            const mockSupabase = {
                from: vi.fn(() => ({
                    insert: vi.fn(() => ({
                        select: vi.fn().mockResolvedValue({
                            data: null,
                            error: new TypeError('Failed to fetch')
                        })
                    }))
                }))
            };

            const user = { id: 'user_1' };
            await processSyncQueue(mockSupabase, user);

            const state = useAppStore.getState();
            expect(state.syncQueue).toHaveLength(2);
            expect(state.isSyncing).toBe(false);
        });
    });

    describe('initSyncListeners', () => {
        it('registers and unregisters window online and offline event listeners', () => {
            const addSpy = vi.spyOn(window, 'addEventListener');
            const removeSpy = vi.spyOn(window, 'removeEventListener');

            const cleanup = initSyncListeners({}, () => ({ id: 'u1' }));

            expect(addSpy).toHaveBeenCalledWith('online', expect.any(Function));
            expect(addSpy).toHaveBeenCalledWith('offline', expect.any(Function));

            cleanup();

            expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function));
            expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function));
        });
    });
});

