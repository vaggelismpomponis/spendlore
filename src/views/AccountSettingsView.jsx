import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, CheckCircle2, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../supabase';
import ViewHeader from '../components/ViewHeader';

const AccountSettingsView = ({ user, onBack, hideHeader }) => {
    const { t: translate } = useSettings();
    const { showToast } = useToast();
    const { isPro } = useSubscription();
    const [imgRetries, setImgRetries] = useState(0);
    const MAX_IMG_RETRIES = 3;

    const photoURL = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.photoURL;
    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.displayName || user?.email?.split('@')[0] || translate('anonymous_user');
    const isGoogle = user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google') || user?.identities?.some(i => i.provider === 'google');
    const provider = isGoogle ? 'Google' : 'Email / Password';
    const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(displayName);
    const [savingName, setSavingName] = useState(false);

    useEffect(() => { setImgRetries(0); }, [photoURL]);

    const handleSaveName = async () => {
        if (!nameInput.trim() || nameInput === displayName) { setEditingName(false); return; }
        setSavingName(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: nameInput.trim(), name: nameInput.trim() }
            });
            if (error) throw error;
            showToast(translate('name_updated_success') || 'Όνομα ενημερώθηκε!', 'success');
            setEditingName(false);
        } catch (e) {
            showToast(translate('name_update_error') || 'Σφάλμα ενημέρωσης.', 'error');
        } finally {
            setSavingName(false);
        }
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">
            {/* ─────── Header ─────── */}
            <ViewHeader
                onBack={onBack}
                title={translate('nav_profile') || 'Προφίλ'}
                hideHeader={hideHeader}
            />

            {/* ─────── Content ─────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* Avatar */}
                <div className="flex justify-center mt-6">
                    <div className="relative shrink-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 shadow-sm border-2 border-white dark:border-surface-dark3">
                            {photoURL && imgRetries < MAX_IMG_RETRIES ? (
                                <img
                                    src={imgRetries > 0 ? `${photoURL}${photoURL.includes('?') ? '&' : '?'}retry=${imgRetries}` : photoURL}
                                    alt="Profile"
                                    referrerPolicy="no-referrer"
                                    crossOrigin="anonymous"
                                    className="w-full h-full object-cover"
                                    onError={() => setTimeout(() => setImgRetries(prev => prev + 1), 500 * imgRetries)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User size={40} strokeWidth={1.5} className="text-gray-400 dark:text-white/40" />
                                </div>
                            )}
                        </div>
                        {isPro && (
                            <div
                                className="absolute -bottom-1 -right-2 select-none"
                                title="Pro Member"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-950 border border-gray-900 dark:border-white shadow-xs">
                                    PRO
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Name Edit */}
                <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 p-5 rounded-2xl shadow-xs mb-3">
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-white/60 mb-2 uppercase tracking-widest">
                        Όνομα Χρήστη / Username
                    </label>
                    {editingName ? (
                        <div className="flex flex-col gap-3 w-full">
                            <input
                                autoFocus
                                value={nameInput}
                                onChange={e => setNameInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditingName(false); setNameInput(displayName); } }}
                                className="w-full text-base font-semibold bg-white dark:bg-surface-dark3 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all shadow-xs"
                            />
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSaveName}
                                    disabled={savingName}
                                    className="flex-1 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-sm rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                                >
                                    <CheckCircle2 size={16} /> {translate('save') === 'save' ? 'Αποθήκευση' : translate('save')}
                                </button>
                                <button
                                    onClick={() => { setEditingName(false); setNameInput(displayName); }}
                                    className="flex-1 py-2.5 bg-gray-200/70 dark:bg-white/[0.08] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-gray-700 dark:text-gray-200 border border-gray-300/60 dark:border-white/10 font-bold text-sm rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                >
                                    <X size={16} /> {translate('cancel') === 'cancel' ? 'Ακύρωση' : translate('cancel')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <h2 className="text-[19px] leading-tight font-extrabold text-gray-900 dark:text-white break-words line-clamp-2">
                                {displayName}
                            </h2>
                            <button
                                onClick={() => setEditingName(true)}
                                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-xs font-bold text-gray-700 dark:text-white/90 border border-gray-200 dark:border-white/10 active:scale-95 transition-all shrink-0 ml-4"
                            >
                                {translate('edit') === 'edit' ? 'Επεξεργασία' : translate('edit')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Readonly details */}
                <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/10 p-5 rounded-2xl shadow-xs space-y-4">
                    <div>
                        <span className="block text-[11px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest mb-1">{translate('email') || 'Email'}</span>
                        <span className="block text-[15px] font-semibold text-gray-800 dark:text-white/90">{user?.email || '—'}</span>
                    </div>
                    <div>
                        <span className="block text-[11px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest mb-1">{translate('provider') || 'Provider'}</span>
                        <span className="block text-[15px] font-semibold text-gray-800 dark:text-white/90 capitalize">{provider}</span>
                    </div>
                    <div>
                        <span className="block text-[11px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest mb-1">{translate('member_since') || 'Member Since'}</span>
                        <span className="block text-[15px] font-semibold text-gray-800 dark:text-white/90">{createdAt}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AccountSettingsView;
