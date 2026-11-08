import React, { useState } from 'react';
import { X, Hourglass, Check } from 'lucide-react';
import { DURATION_OPTIONS, DEFAULT_COOLING_OFF_HOURS, createCoolingOffItem } from '../utils/coolingOff';

const CATEGORIES = ['Διασκέδαση', 'Σπίτι', 'Σούπερ Μάρκετ', 'Φαγητό', 'Καφές', 'Βενζίνη', 'Υγεία', 'Άλλο'];

const CoolingOffModal = ({ isOpen, onClose, onAdd, language = 'el' }) => {
    const isEL = language === 'el';
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Διασκέδαση');
    const [durationHours, setDurationHours] = useState(DEFAULT_COOLING_OFF_HOURS);
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !amount) return;

        const item = createCoolingOffItem({
            title,
            amount,
            category,
            note,
            durationHours
        });

        onAdd(item);
        setTitle('');
        setAmount('');
        setNote('');
        setDurationHours(DEFAULT_COOLING_OFF_HOURS);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl border border-gray-300 dark:border-white/10 shadow-2xl p-5 sm:p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/10">
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                            {isEL ? 'Προσθήκη σε Αναμονή 72 Ωρών' : 'Add to 72-Hour Cooling-Off'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {isEL ? 'Καταγράψτε τον πειρασμό και δώστε χρόνο στον εγκέφαλό σας' : 'Park your urge and let impulse dopamine settle'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-200/60 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                            {isEL ? 'Τι θέλεις να αγοράσεις;' : 'What do you want to buy?'}
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={isEL ? 'π.χ. Ακουστικά Sony, Sneakers Nike' : 'e.g. Sony Headphones, Sneakers'}
                            className="w-full py-2.5 px-3.5 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                {isEL ? 'Ποσό (€)' : 'Amount (€)'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full py-2.5 px-3.5 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all tabular-nums"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                {isEL ? 'Κατηγορία' : 'Category'}
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full py-2.5 px-3.5 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Duration chips */}
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                            {isEL ? 'Χρόνος Αναμονής (Cooling-Off)' : 'Cooling-Off Duration'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {DURATION_OPTIONS.map(opt => (
                                <button
                                    key={opt.hours}
                                    type="button"
                                    onClick={() => setDurationHours(opt.hours)}
                                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                                        durationHours === opt.hours
                                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent shadow-xs'
                                            : 'bg-white dark:bg-surface-dark3 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {isEL ? opt.labelEl : opt.labelEn}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-gray-200/70 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-300/60 dark:border-white/[0.1] font-bold rounded-xl transition-all active:scale-95 text-sm"
                        >
                            {isEL ? 'Ακύρωση' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                        >
                            <Hourglass size={16} />
                            <span>{isEL ? 'Έναρξη 72h' : 'Start 72h'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CoolingOffModal;

