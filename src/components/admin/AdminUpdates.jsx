import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    RefreshCw, Plus, Trash2, Star, Shield, CheckCircle2,
    HardDriveDownload, X, Calendar, Check
} from 'lucide-react';

const iconOptions = [
    { id: 'star', component: Star, label: 'Star' },
    { id: 'shield', component: Shield, label: 'Security' },
    { id: 'check', component: CheckCircle2, label: 'Check' },
    { id: 'download', component: HardDriveDownload, label: 'Download' },
];

const AdminUpdates = ({
    updates = [],
    showUpdateModal,
    setShowUpdateModal,
    newUpdate,
    setNewUpdate,
    addFeature,
    removeFeature,
    updateFeature,
    onPublish,
    onDelete,
    translate = (k) => k
}) => {
    const latestVersion = updates.length > 0 ? updates[0].version : null;
    const totalFeatures = useMemo(() => {
        return updates.reduce((acc, u) => acc + (u.features?.length || 0), 0);
    }, [updates]);

    return (
        <div className="space-y-5 animate-fade-in">

            {/* ─────── Executive Updates Hub Header ─────── */}
            <div className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <RefreshCw size={22} className="text-gray-900 dark:text-white shrink-0" strokeWidth={2.2} />
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                                Application Release Updates
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                In-app 'What's New' changelog entries, version notices, and feature releases
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowUpdateModal(true)}
                            className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-xs"
                        >
                            <Plus size={14} />
                            <span>{translate('admin_create_update') || 'Publish New Update'}</span>
                        </button>
                    </div>
                </div>

                {/* Status Chips Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            Total Releases
                        </span>
                        <span className="block text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                            {updates.length}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
                            Latest Version
                        </span>
                        <span className="block text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                            {latestVersion ? `v${latestVersion}` : 'None'}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                            Feature Bullet Points
                        </span>
                        <span className="block text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                            {totalFeatures}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                        <span className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
                            Client Delivery
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active In-App</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────── Releases Feed ─────── */}
            {updates.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-8 shadow-xs">
                    <RefreshCw size={36} className="mx-auto text-gray-300 dark:text-white/20 mb-3" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        No Releases Published Yet
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 mb-5">
                        Create and broadcast your first release update so users can see changelogs directly inside the app.
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowUpdateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs shadow-xs active:scale-95 transition-all"
                    >
                        <Plus size={14} />
                        <span>Publish First Release</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {updates.map(upd => (
                        <div
                            key={upd.id}
                            className="bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-200 dark:border-white/10 p-5 sm:p-6 shadow-xs space-y-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="px-2.5 py-0.5 rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-black tracking-wide">
                                            v{upd.version}
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(upd.release_date).toLocaleDateString('el-GR', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white pt-1">
                                        {upd.title_el || upd.title_en || 'Application Update'}
                                    </h4>
                                    {upd.title_en && upd.title_el && (
                                        <p className="text-xs text-gray-400 font-medium">
                                            {upd.title_en}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onDelete(upd.id)}
                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                                    title="Delete release entry"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>

                            {/* Features list */}
                            {upd.features && upd.features.length > 0 && (
                                <div className="pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                        Highlights ({upd.features.length})
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {upd.features.map((f, i) => (
                                            <div
                                                key={i}
                                                className="px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5 font-medium"
                                            >
                                                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                                <span>{f.title_en || f.title_el || `Feature ${i + 1}`}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ─────── Create Update Modal (Portaled) ─────── */}
            {typeof document !== 'undefined' && showUpdateModal && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="create-update-modal-title"
                >
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-200"
                        onClick={() => setShowUpdateModal(false)}
                    />

                    {/* Modal Surface */}
                    <div className="relative w-full max-w-xl bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl border border-gray-300 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="shrink-0 p-5 sm:p-6 border-b border-gray-200/80 dark:border-white/10 flex items-center justify-between">
                            <div>
                                <h3 id="create-update-modal-title" className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                    {translate('admin_publish_update_title') || 'Δημοσίευση Νέας Ενημέρωσης'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {translate('admin_publish_update_subtitle') || 'Προσθέστε λεπτομέρειες έκδοσης και χαρακτηριστικά'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowUpdateModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-200/60 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                                aria-label={translate('close') || 'Κλείσιμο'}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
                            {/* Version and Titles */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                        {translate('admin_version_label') || 'Έκδοση'}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="1.2.0"
                                        className="w-full py-2.5 px-3.5 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all"
                                        value={newUpdate.version}
                                        onChange={e => setNewUpdate({ ...newUpdate, version: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                            {translate('admin_title_el_label') || 'Ελληνικός Τίτλος'}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Τι νέο υπάρχει;"
                                            className="w-full py-2.5 px-3.5 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all"
                                            value={newUpdate.title_el}
                                            onChange={e => setNewUpdate({ ...newUpdate, title_el: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                            {translate('admin_title_en_label') || 'Αγγλικός Τίτλος'}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="What's New?"
                                            className="w-full py-2.5 px-3.5 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all"
                                            value={newUpdate.title_en}
                                            onChange={e => setNewUpdate({ ...newUpdate, title_en: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Features list */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between pb-1">
                                    <span className="text-[11px] font-bold text-gray-500 dark:text-white/60 uppercase tracking-widest">
                                        {translate('admin_features_bullet') || 'Χαρακτηριστικά Έκδοσης'} ({newUpdate.features.length})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200/70 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-300/60 dark:border-white/[0.1] font-bold rounded-xl text-xs transition-all active:scale-95"
                                    >
                                        <Plus size={13} />
                                        <span>{translate('admin_add_feature_btn') || 'Προσθήκη'}</span>
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {newUpdate.features.map((feature, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 rounded-xl space-y-3 relative"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(idx)}
                                                className="absolute top-3 right-3 text-gray-400 hover:text-rose-600 transition-colors p-1"
                                                title="Αφαίρεση"
                                            >
                                                <X size={15} />
                                            </button>

                                            <div className="flex gap-1.5 bg-gray-50 dark:bg-surface-dark2 p-1 rounded-xl w-fit border border-gray-200 dark:border-white/10">
                                                {iconOptions.map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => updateFeature(idx, 'icon', opt.id)}
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                                            feature.icon === opt.id
                                                                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
                                                                : 'text-gray-400 hover:bg-gray-200/60 dark:hover:bg-white/10'
                                                        }`}
                                                        title={opt.label}
                                                    >
                                                        <opt.component size={13} />
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                <input
                                                    type="text"
                                                    placeholder="Τίτλος (Ελληνικά)"
                                                    className="p-2.5 bg-gray-50 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white"
                                                    value={feature.title_el}
                                                    onChange={e => updateFeature(idx, 'title_el', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Title (English)"
                                                    className="p-2.5 bg-gray-50 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white"
                                                    value={feature.title_en}
                                                    onChange={e => updateFeature(idx, 'title_en', e.target.value)}
                                                />
                                                <textarea
                                                    placeholder="Περιγραφή (Ελληνικά)"
                                                    className="p-2.5 bg-gray-50 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-800 dark:text-gray-200 placeholder:text-gray-400 min-h-[50px] resize-none focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white"
                                                    value={feature.desc_el}
                                                    onChange={e => updateFeature(idx, 'desc_el', e.target.value)}
                                                />
                                                <textarea
                                                    placeholder="Description (English)"
                                                    className="p-2.5 bg-gray-50 dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-800 dark:text-gray-200 placeholder:text-gray-400 min-h-[50px] resize-none focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white"
                                                    value={feature.desc_en}
                                                    onChange={e => updateFeature(idx, 'desc_en', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {newUpdate.features.length === 0 && (
                                        <div className="py-8 border border-dashed border-gray-300 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-400 text-center px-4">
                                            <Plus size={20} className="mb-1 opacity-50" />
                                            <p className="text-xs font-medium">
                                                {translate('admin_add_feature_hint') || 'Κάντε κλικ στο "Προσθήκη" για να προσθέσετε χαρακτηριστικό'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="shrink-0 p-5 sm:p-6 bg-gray-100/90 dark:bg-surface-dark2 border-t border-gray-200/80 dark:border-white/10 flex gap-3 pt-3">
                            <button
                                type="button"
                                onClick={() => setShowUpdateModal(false)}
                                className="flex-1 py-2.5 bg-gray-200/70 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-300/60 dark:border-white/[0.1] font-bold rounded-xl transition-all active:scale-95 text-sm flex items-center justify-center"
                            >
                                {translate('cancel') || 'Ακύρωση'}
                            </button>
                            <button
                                type="button"
                                onClick={onPublish}
                                className="flex-1 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                            >
                                <Check size={16} />
                                <span className="truncate">{translate('admin_publish_btn') || 'Δημοσίευση'}</span>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminUpdates;
