import React, { useState } from 'react';
import { ArrowLeft, Hourglass, Plus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { calculateCoolingOffStats, denormalizeCoolingOffItem } from '../utils/coolingOff';
import { supabase } from '../supabase';
import { isNetworkError } from '../services/SyncService';
import CoolingOffStats from '../components/CoolingOffStats';
import CoolingOffItem from '../components/CoolingOffItem';
import CoolingOffModal from '../components/CoolingOffModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { hapticSaveSuccess, hapticImpactLight } from '../utils/haptics';

const CoolingOffView = ({ user, onBack, onAddTransaction, hideHeader = false }) => {
    const { t, language } = useSettings();
    const isEL = language === 'el';
    const { showToast } = useToast();

    const items = useAppStore(state => state.coolingOffItems || []);
    const addItem = useAppStore(state => state.addCoolingOffItem);
    const updateItem = useAppStore(state => state.updateCoolingOffItem);
    const removeItem = useAppStore(state => state.removeCoolingOffItem);

    const [activeTab, setActiveTab] = useState('active');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const stats = calculateCoolingOffStats(items);
    const activeList = items.filter(i => i.status === 'active');
    const historyList = items.filter(i => i.status === 'passed' || i.status === 'bought');

    const handleAddItem = async (item) => {
        addItem(item);
        try {
            const uid = user?.id || (await supabase.auth.getUser())?.data?.user?.id;
            if (uid) {
                const dbPayload = denormalizeCoolingOffItem(item, uid);
                const { error } = await supabase.from('cooling_off_items').insert(dbPayload);
                if (error && isNetworkError(error)) {
                    useAppStore.getState().addToSyncQueue({
                        action: 'insert',
                        entity: 'cooling_off_items',
                        payload: dbPayload,
                        localId: item.id
                    });
                }
            }
        } catch {
            // keep optimistic
        }
    };

    const handlePass = async (id) => {
        const target = items.find(i => i.id === id);
        const decidedAt = new Date().toISOString();
        const savedAmount = target?.amount || 0;
        updateItem(id, { status: 'passed', decidedAt, savedAmount });
        hapticSaveSuccess();
        showToast(isEL ? '🎉 Γλίτωσες τα χρήματα από μία παρορμητική αγορά!' : '🎉 You saved money from an impulse purchase!', 'success');

        try {
            const { error } = await supabase
                .from('cooling_off_items')
                .update({ status: 'passed', decided_at: decidedAt, saved_amount: savedAmount })
                .eq('id', id);
            if (error && isNetworkError(error)) {
                useAppStore.getState().addToSyncQueue({
                    action: 'update',
                    entity: 'cooling_off_items',
                    targetId: id,
                    payload: { status: 'passed', decided_at: decidedAt, saved_amount: savedAmount }
                });
            }
        } catch {
            // keep optimistic
        }
    };

    const handleBuy = async (item) => {
        const decidedAt = new Date().toISOString();
        updateItem(item.id, { status: 'bought', decidedAt });
        if (typeof onAddTransaction === 'function') {
            onAddTransaction({ type: 'expense', amount: item.amount, category: item.category || 'Άλλο', note: `${item.note || ''} (72h Rule)`.trim() });
        }
        hapticSaveSuccess();
        showToast(isEL ? 'Η συναλλαγή καταχωρήθηκε στα έξοδά σας.' : 'Transaction added to your expenses.', 'info');

        try {
            const { error } = await supabase
                .from('cooling_off_items')
                .update({ status: 'bought', decided_at: decidedAt })
                .eq('id', item.id);
            if (error && isNetworkError(error)) {
                useAppStore.getState().addToSyncQueue({
                    action: 'update',
                    entity: 'cooling_off_items',
                    targetId: item.id,
                    payload: { status: 'bought', decided_at: decidedAt }
                });
            }
        } catch {
            // keep optimistic
        }
    };

    const handleExtend = async (id, extraHours = 24) => {
        const target = items.find(i => i.id === id);
        if (!target) return;
        const newExp = new Date(Math.max(Date.now(), new Date(target.expiresAt).getTime()) + extraHours * 3600 * 1000).toISOString();
        updateItem(id, { expiresAt: newExp });
        hapticImpactLight();
        showToast(isEL ? `Παράταση αναμονής +${extraHours} ώρες!` : `Cooling-off extended by +${extraHours}h!`, 'info');

        try {
            const { error } = await supabase
                .from('cooling_off_items')
                .update({ expires_at: newExp })
                .eq('id', id);
            if (error && isNetworkError(error)) {
                useAppStore.getState().addToSyncQueue({
                    action: 'update',
                    entity: 'cooling_off_items',
                    targetId: id,
                    payload: { expires_at: newExp }
                });
            }
        } catch {
            // keep optimistic
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        const targetId = itemToDelete.id;
        removeItem(targetId);
        showToast(isEL ? 'Η επιθυμία διαγράφηκε.' : 'Item removed.', 'info');
        setItemToDelete(null);

        try {
            const { error } = await supabase
                .from('cooling_off_items')
                .delete()
                .eq('id', targetId);
            if (error && isNetworkError(error)) {
                useAppStore.getState().addToSyncQueue({
                    action: 'delete',
                    entity: 'cooling_off_items',
                    targetId
                });
            }
        } catch {
            // keep optimistic
        }
    };

    const currentList = activeTab === 'active' ? activeList : historyList;

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-surface-dark animate-fade-in transition-colors duration-300">
            {/* Sticky Header for Mobile */}
            {!hideHeader && (
                <div
                    className="shrink-0 sticky top-0 z-40 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md px-4 pb-3 shadow-xs border-b border-gray-200/80 dark:border-white/10"
                    style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
                >
                    <div className="flex items-center justify-between min-h-[40px] gap-3">
                        <button type="button" onClick={onBack} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 flex items-center justify-center text-gray-600 dark:text-gray-300 active:scale-95 transition-all" aria-label="Back">
                            <ArrowLeft size={16} strokeWidth={2.5} />
                        </button>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white truncate text-center flex-1">
                            {t('cooling_off_title') || (isEL ? 'Κανόνας 72 Ωρών' : '72-Hour Cooling-Off')}
                        </h2>
                        <button type="button" onClick={() => setIsModalOpen(true)} className="px-3 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0">
                            <Plus size={14} strokeWidth={2.5} /> <span>{isEL ? 'Νέα Επιθυμία' : 'Add'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 lg:px-0 py-5 lg:py-0 space-y-5">
                <div className="w-full mx-auto space-y-5">
                    {hideHeader && (
                        <div className="flex items-center justify-between gap-4 pb-1">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('cooling_off_title') || (isEL ? 'Κανόνας 72 Ωρών' : '72-Hour Cooling-Off')}</h1>
                                <p className="text-xs text-gray-400 mt-0.5">{isEL ? 'Λίστα αναμονής και αποφυγής παρορμητικών αγορών' : 'Anti-impulse purchasing wishlist'}</p>
                            </div>
                            <button type="button" onClick={() => setIsModalOpen(true)} className="px-3.5 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5">
                                <Plus size={15} strokeWidth={2.5} /> <span>{isEL ? 'Νέα Επιθυμία (72h)' : 'New Impulse (72h)'}</span>
                            </button>
                        </div>
                    )}

                    <div className="bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                        <div className="flex items-center gap-2.5 text-violet-600 dark:text-violet-400">
                            <Hourglass size={20} strokeWidth={2.3} />
                            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">{isEL ? 'Κανόνας Ψυχραιμίας 72 Ωρών' : '72-Hour Cooling-Off Rule'}</h2>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                            {isEL ? 'Θέστε οποιαδήποτε μη απαραίτητη αγορά σε αναμονή 72 ωρών. Το 70% των παρορμητικών αγορών ξεπερνιέται μόλις υποχωρήσει η αρχική ντοπαμίνη!' : 'Park non-essential buys for 72 hours. Over 70% of impulse buying urges disappear once dopamine settles!'}
                        </p>
                    </div>

                    <CoolingOffStats stats={stats} language={language} />

                    <div className="flex bg-gray-200/70 dark:bg-white/[0.08] p-1 rounded-xl w-fit">
                        <button type="button" onClick={() => setActiveTab('active')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'active' ? 'bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500 dark:text-gray-400'}`}>
                            {isEL ? 'Σε Αναμονή' : 'In Cooling-Off'} ({activeList.length})
                        </button>
                        <button type="button" onClick={() => setActiveTab('history')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500 dark:text-gray-400'}`}>
                            {isEL ? 'Ιστορικό Αποφάσεων' : 'Decision History'} ({historyList.length})
                        </button>
                    </div>

                    <div className="space-y-3">
                        {currentList.map(item => (
                            <CoolingOffItem key={item.id} item={item} language={language} onPass={handlePass} onBuy={handleBuy} onExtend={handleExtend} onDelete={(id) => setItemToDelete(items.find(i => i.id === id))} />
                        ))}
                        {currentList.length === 0 && (
                            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 space-y-2">
                                <Hourglass size={32} className="mx-auto text-gray-300 dark:text-gray-600" />
                                <h4 className="text-sm font-bold text-gray-800 dark:text-white">{isEL ? 'Καμία καταχώρηση' : 'No items here'}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {activeTab === 'active' ? (isEL ? 'Όταν νιώσετε πειρασμό για μία αγορά, προσθέστε την εδώ!' : 'When you feel the urge to buy something, add it here!') : (isEL ? 'Οι αποφάσεις μετά τις 72 ώρες θα εμφανίζονται εδώ.' : 'Decisions made after 72 hours will appear here.')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CoolingOffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddItem} />

            <ConfirmationModal
                isOpen={Boolean(itemToDelete)}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title={isEL ? 'Διαγραφή Επιθυμίας' : 'Delete Impulse Item'}
                message={isEL 
                    ? `Είστε σίγουροι ότι θέλετε να διαγράψετε το «${itemToDelete?.title}» από τη λίστα αναμονής;`
                    : `Are you sure you want to remove "${itemToDelete?.title}" from cooling-off?`}
                confirmText={isEL ? 'Διαγραφή' : 'Delete'}
            />
        </div>
    );
};

export default CoolingOffView;
