import React, { useState } from 'react';
import { ArrowLeft, Hourglass, Plus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { calculateCoolingOffStats } from '../utils/coolingOff';
import CoolingOffStats from '../components/CoolingOffStats';
import CoolingOffItem from '../components/CoolingOffItem';
import CoolingOffModal from '../components/CoolingOffModal';
import { hapticSaveSuccess, hapticImpactLight } from '../utils/haptics';

const CoolingOffView = ({ onBack, onAddTransaction, hideHeader = false }) => {
    const { language } = useSettings();
    const isEL = language === 'el';
    const { showToast } = useToast();

    const items = useAppStore(state => state.coolingOffItems || []);
    const addItem = useAppStore(state => state.addCoolingOffItem);
    const updateItem = useAppStore(state => state.updateCoolingOffItem);
    const removeItem = useAppStore(state => state.removeCoolingOffItem);

    const [activeTab, setActiveTab] = useState('active');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const stats = calculateCoolingOffStats(items);
    const activeList = items.filter(i => i.status === 'active');
    const historyList = items.filter(i => i.status === 'passed' || i.status === 'bought');

    const handlePass = (id) => {
        const target = items.find(i => i.id === id);
        updateItem(id, { status: 'passed', decidedAt: new Date().toISOString(), savedAmount: target?.amount || 0 });
        hapticSaveSuccess();
        showToast(isEL ? '🎉 Γλίτωσες τα χρήματα από μία παρορμητική αγορά!' : '🎉 You saved money from an impulse purchase!', 'success');
    };

    const handleBuy = (item) => {
        updateItem(item.id, { status: 'bought', decidedAt: new Date().toISOString() });
        if (typeof onAddTransaction === 'function') {
            onAddTransaction({ type: 'expense', amount: item.amount, category: item.category || 'Άλλο', note: `${item.note || ''} (72h Rule)`.trim() });
        }
        hapticSaveSuccess();
        showToast(isEL ? 'Η συναλλαγή καταχωρήθηκε στα έξοδά σας.' : 'Transaction added to your expenses.', 'info');
    };

    const handleExtend = (id, extraHours = 24) => {
        const target = items.find(i => i.id === id);
        if (!target) return;
        const newExp = new Date(Math.max(Date.now(), new Date(target.expiresAt).getTime()) + extraHours * 3600 * 1000).toISOString();
        updateItem(id, { expiresAt: newExp });
        hapticImpactLight();
        showToast(isEL ? `Παράταση αναμονής +${extraHours} ώρες!` : `Cooling-off extended by +${extraHours}h!`, 'info');
    };

    const currentList = activeTab === 'active' ? activeList : historyList;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-5 p-4 sm:p-6 pb-24 animate-fade-in">
            {!hideHeader && (
                <div className="flex items-center justify-between gap-4">
                    <button type="button" onClick={onBack} className="p-2.5 rounded-xl border border-gray-300/60 dark:border-white/10 bg-gray-200/70 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] transition-all flex items-center gap-2 text-xs font-bold">
                        <ArrowLeft size={16} /> <span>{isEL ? 'Πίσω' : 'Back'}</span>
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(true)} className="py-2.5 px-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 text-xs">
                        <Plus size={16} /> <span>{isEL ? 'Νέα Επιθυμία (72h)' : 'Add Impulse (72h)'}</span>
                    </button>
                </div>
            )}

            <div className="bg-gray-100/90 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <div className="flex items-center gap-2.5 text-violet-600 dark:text-violet-400">
                    <Hourglass size={20} strokeWidth={2.3} />
                    <h2 className="text-lg font-black text-gray-900 dark:text-white">
                        {isEL ? 'Κανόνας Ψυχραιμίας 72 Ωρών' : '72-Hour Cooling-Off Rule'}
                    </h2>
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
                    <CoolingOffItem key={item.id} item={item} language={language} onPass={handlePass} onBuy={handleBuy} onExtend={handleExtend} onDelete={removeItem} />
                ))}

                {currentList.length === 0 && (
                    <div className="p-8 text-center bg-gray-100/60 dark:bg-surface-dark2/60 border border-dashed border-gray-300 dark:border-white/10 rounded-2xl space-y-2">
                        <Hourglass size={28} className="mx-auto text-gray-400 dark:text-gray-500 stroke-[1.8]" />
                        <h4 className="text-sm font-bold text-gray-800 dark:text-white">{isEL ? 'Καμία καταχώρηση' : 'No items here'}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activeTab === 'active' ? (isEL ? 'Όταν νιώσετε πειρασμό για μία αγορά, προσθέστε την εδώ!' : 'When you feel the urge to buy something, add it here!') : (isEL ? 'Οι αποφάσεις μετά τις 72 ώρες θα εμφανίζονται εδώ.' : 'Decisions made after 72 hours will appear here.')}
                        </p>
                    </div>
                )}
            </div>

            <CoolingOffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addItem} language={language} />
        </div>
    );
};

export default CoolingOffView;
