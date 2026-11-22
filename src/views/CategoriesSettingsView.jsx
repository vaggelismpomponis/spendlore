import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Tag,
    Plus,
    Pencil,
    Trash2,
    Check,
    X,
    Info,
    ChevronRight,
    SlidersHorizontal,
    MoreHorizontal,
    RotateCcw,
    ArrowRightLeft
} from 'lucide-react';
import MerchantRulesManager from '../components/MerchantRulesManager';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { isBaseCategory } from '../utils/categoryTranslations';
import ViewHeader from '../components/ViewHeader';
import CustomSelect from '../components/CustomSelect';
import CategoryIcon, {
    getCategoryIcon,
    getCategoryAccent,
    AVAILABLE_CATEGORY_ICONS,
    AVAILABLE_CATEGORY_COLORS
} from '../components/CategoryIcon';
import ProBadge from '../components/ProBadge';
import DesktopBreadcrumb from '../components/DesktopBreadcrumb';

const BASE_EXPENSE_CATEGORIES = ['Σούπερ Μάρκετ', 'Φαγητό', 'Καφές', 'Σπίτι', 'Λογαριασμοί', 'Διασκέδαση', 'Βενζίνη', 'Υγεία', 'Άλλο'];
const BASE_INCOME_CATEGORIES = ['Μισθός', 'Δώρο', 'Επενδύσεις', 'Άλλα Έσοδα'];

const CATEGORY_META_STORAGE_KEY = 'spendlore_categories_metadata';

const getStoredCategoryMeta = () => {
    try {
        const raw = localStorage.getItem(CATEGORY_META_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const CategoriesSettingsView = ({ user, transactions = [], onBack, hideHeader = false }) => {
    const {
        language,
        t: translate,
        customCategories,
        addCustomCategory,
        editCustomCategory,
        deleteCustomCategory,
        merchantRules,
        addMerchantRule,
        editMerchantRule,
        deleteMerchantRule,
        resetMerchantRulesToDefault
    } = useSettings();
    const isEL = language === 'el';
    const { showToast } = useToast();
    const { isPro, openUpgradeModal } = useSubscription();

    // Main tabs: 'categories' vs 'rules'
    const [mainTab, setMainTab] = useState('categories');
    // Active category type filter: 'expense' (default for test compatibility), 'income', 'all'
    const [activeType, setActiveType] = useState('expense');

    // Category Metadata (color, icon, parent)
    const [categoryMeta, setCategoryMeta] = useState(() => getStoredCategoryMeta());

    const saveCategoryMeta = (catName, meta) => {
        setCategoryMeta(prev => {
            const next = { ...prev, [catName]: { ...(prev[catName] || {}), ...meta } };
            try {
                localStorage.setItem(CATEGORY_META_STORAGE_KEY, JSON.stringify(next));
            } catch {
                // Ignore storage errors
            }
            return next;
        });
    };

    // Header more menu dropdown state
    const [openHeaderMenu, setOpenHeaderMenu] = useState(false);
    // Row more menu dropdown state
    const [openRowMenu, setOpenRowMenu] = useState(null);

    // Modal state for Add/Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null); // { oldName, newName, type }
    const [isSaving, setIsSaving] = useState(false);

    // Modal form fields
    const [formName, setFormName] = useState('');
    const [formParent, setFormParent] = useState('');
    const [formType, setFormType] = useState('expense');
    const [formColor, setFormColor] = useState('#8b5cf6');
    const [formIconId, setFormIconId] = useState('Utensils');
    const [showIconPicker, setShowIconPicker] = useState(false);

    // Delete single category modal
    const [deleteTarget, setDeleteTarget] = useState(null); // { name, type, txCount, reassignTo }
    const [isDeleting, setIsDeleting] = useState(false);

    // Delete all categories prompt
    const [promptDeleteAll, setPromptDeleteAll] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    // Calculate transaction counts for each category
    const txCounts = useMemo(() => {
        const counts = {};
        (transactions || []).forEach(tx => {
            const cat = tx.category?.trim();
            if (cat) {
                counts[cat] = (counts[cat] || 0) + 1;
            }
        });
        return counts;
    }, [transactions]);

    const expenseCustom = customCategories?.expense || [];
    const incomeCustom = customCategories?.income || [];

    // Categories to display based on activeType tab
    const displayedCategories = useMemo(() => {
        if (activeType === 'expense') {
            return expenseCustom.map(name => ({ name, type: 'expense', isBase: false }));
        }
        if (activeType === 'income') {
            return incomeCustom.map(name => ({ name, type: 'income', isBase: false }));
        }
        // 'all' tab: all custom categories combined
        return [
            ...expenseCustom.map(name => ({ name, type: 'expense', isBase: false })),
            ...incomeCustom.map(name => ({ name, type: 'income', isBase: false }))
        ];
    }, [activeType, expenseCustom, incomeCustom]);

    // Available target categories for reassigning deleted transactions
    const availableReassignTargets = useMemo(() => {
        if (!deleteTarget) return [];
        const base = deleteTarget.type === 'income' ? BASE_INCOME_CATEGORIES : BASE_EXPENSE_CATEGORIES;
        const custom = (deleteTarget.type === 'income' ? incomeCustom : expenseCustom).filter(c => c !== deleteTarget.name);
        return [...base, ...custom];
    }, [deleteTarget, incomeCustom, expenseCustom]);

    // Available parent options for modal dropdown
    const availableParentOptions = useMemo(() => {
        const all = [...BASE_EXPENSE_CATEGORIES, ...BASE_INCOME_CATEGORIES, ...expenseCustom, ...incomeCustom];
        const unique = Array.from(new Set(all));
        if (editingCategory) {
            return unique.filter(c => c.toLowerCase() !== editingCategory.oldName.toLowerCase());
        }
        return unique;
    }, [expenseCustom, incomeCustom, editingCategory]);

    // Selected icon component for modal avatar preview
    const selectedIconComponent = useMemo(() => {
        const found = AVAILABLE_CATEGORY_ICONS.find(item => item.id === formIconId);
        return found ? found.icon : getCategoryIcon(formName);
    }, [formIconId, formName]);

    // Open modal to add category
    const handleOpenAddModal = () => {
        if (!isPro) {
            openUpgradeModal('categories');
            return;
        }
        const defaultType = activeType === 'income' ? 'income' : 'expense';
        setEditingCategory(null);
        setFormName('');
        setFormParent('');
        setFormType(defaultType);
        setFormColor(defaultType === 'income' ? '#10b981' : '#f97316');
        setFormIconId(defaultType === 'income' ? 'Banknote' : 'Utensils');
        setShowIconPicker(false);
        setIsModalOpen(true);
    };

    // Open modal to edit category
    const handleStartEdit = (catName, type) => {
        const catType = type || (incomeCustom.includes(catName) ? 'income' : 'expense');
        const meta = categoryMeta[catName] || {};
        setEditingCategory({ oldName: catName, newName: catName, type: catType });
        setFormName(catName);
        setFormParent(meta.parent || '');
        setFormType(catType);
        setFormColor(meta.color || getCategoryAccent(catName, catType));
        setFormIconId(meta.iconId || 'Utensils');
        setShowIconPicker(false);
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormName('');
        setFormParent('');
        setShowIconPicker(false);
    };

    // Form submit (Add or Edit)
    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        const trimmed = formName.trim();
        if (!trimmed) {
            showToast(translate('category_name_empty') || 'Το όνομα της κατηγορίας δεν μπορεί να είναι κενό.', 'error');
            return;
        }

        if (editingCategory) {
            // Edit flow
            const { oldName, type } = editingCategory;
            if (trimmed === oldName && formParent === (categoryMeta[oldName]?.parent || '') && formColor === (categoryMeta[oldName]?.color || '')) {
                handleCloseModal();
                return;
            }

            if (trimmed !== oldName && isBaseCategory(trimmed)) {
                showToast(translate('category_is_base') || 'Αυτό το όνομα ανήκει στις βασικές κατηγορίες.', 'error');
                return;
            }

            setIsSaving(true);
            try {
                const res = editCustomCategory(type, oldName, trimmed);
                if (!res.success) {
                    if (res.error === 'already_exists') {
                        showToast(translate('category_already_exists') || 'Υπάρχει ήδη κατηγορία με αυτό το όνομα.', 'error');
                    } else if (res.error === 'base_category') {
                        showToast(translate('category_is_base') || 'Αυτό το όνομα ανήκει στις βασικές κατηγορίες.', 'error');
                    } else {
                        showToast(translate('error_message_generic') || 'Σφάλμα κατά την ενημέρωση.', 'error');
                    }
                    return;
                }

                saveCategoryMeta(trimmed, {
                    color: formColor,
                    iconId: formIconId,
                    parent: formParent || null
                });

                showToast(translate('category_updated_success') || 'Η κατηγορία ενημερώθηκε επιτυχώς!', 'success');
                handleCloseModal();
            } catch (err) {
                console.error('Error saving edited category:', err);
                showToast(translate('error_message_generic') || 'Σφάλμα κατά την ενημέρωση.', 'error');
            } finally {
                setIsSaving(false);
            }
        } else {
            // Add flow
            if (!isPro) {
                openUpgradeModal('categories');
                return;
            }

            if (isBaseCategory(trimmed)) {
                showToast(translate('category_is_base') || 'Αυτό το όνομα ανήκει στις βασικές κατηγορίες.', 'error');
                return;
            }

            const currentList = formType === 'income' ? incomeCustom : expenseCustom;
            const exists = currentList.some(c => c.toLowerCase() === trimmed.toLowerCase());
            if (exists) {
                showToast(translate('category_already_exists') || 'Υπάρχει ήδη κατηγορία με αυτό το όνομα.', 'error');
                return;
            }

            addCustomCategory(formType, trimmed);
            saveCategoryMeta(trimmed, {
                color: formColor,
                iconId: formIconId,
                parent: formParent || null
            });

            handleCloseModal();
            showToast(translate('category_added_success') || 'Η κατηγορία προστέθηκε επιτυχώς!', 'success');
        }
    };

    // Prompt single delete
    const handlePromptDelete = (catName, type) => {
        const catType = type || (incomeCustom.includes(catName) ? 'income' : 'expense');
        const count = txCounts[catName] || 0;
        const defaultFallback = catType === 'income' ? 'Άλλα Έσοδα' : 'Άλλο';
        setDeleteTarget({
            name: catName,
            type: catType,
            txCount: count,
            reassignTo: defaultFallback
        });
    };

    // Confirm single delete
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = deleteCustomCategory(deleteTarget.type, deleteTarget.name, deleteTarget.reassignTo);
            if (res.success) {
                showToast(translate('category_deleted_success') || 'Η κατηγορία διαγράφηκε επιτυχώς!', 'success');
            } else {
                showToast(translate('error_message_generic') || 'Σφάλμα κατά τη διαγραφή.', 'error');
            }
        } catch (err) {
            console.error('Error deleting category:', err);
            showToast(translate('error_message_generic') || 'Σφάλμα κατά τη διαγραφή.', 'error');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    // Delete all custom categories
    const handleConfirmDeleteAll = async () => {
        setIsDeletingAll(true);
        try {
            const allCustomExpenses = [...expenseCustom];
            const allCustomIncome = [...incomeCustom];

            allCustomExpenses.forEach(cat => {
                deleteCustomCategory('expense', cat, 'Άλλο');
            });
            allCustomIncome.forEach(cat => {
                deleteCustomCategory('income', cat, 'Άλλα Έσοδα');
            });

            showToast(translate('all_categories_deleted') || (isEL ? 'Όλες οι κατηγορίες διαγράφηκαν' : 'All categories deleted'), 'success');
            setPromptDeleteAll(false);
        } catch (err) {
            console.error('Error deleting all categories:', err);
            showToast(translate('error_message_generic') || 'Σφάλμα κατά τη διαγραφή.', 'error');
        } finally {
            setIsDeletingAll(false);
        }
    };

    // Restore defaults (recommended)
    const handleRestoreDefaults = () => {
        // Reset merchant rules to starter
        resetMerchantRulesToDefault?.();
        showToast(translate('defaults_restored') || (isEL ? 'Επαναφέρθηκαν οι προεπιλεγμένες κατηγορίες' : 'Default categories restored'), 'success');
    };

    // Close any open menus when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setOpenHeaderMenu(false);
            setOpenRowMenu(null);
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // Lock body scroll and trap keyboard escape when any modal is open
    useEffect(() => {
        const isAnyModalOpen = Boolean(isModalOpen || deleteTarget || promptDeleteAll);
        if (!isAnyModalOpen) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (isModalOpen && !isSaving) handleCloseModal();
                if (deleteTarget && !isDeleting) setDeleteTarget(null);
                if (promptDeleteAll && !isDeletingAll) setPromptDeleteAll(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isModalOpen, deleteTarget, promptDeleteAll, isSaving, isDeleting, isDeletingAll]);

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">
            {/* Header */}
            <ViewHeader
                onBack={onBack}
                title={
                    <div className="inline-flex items-center justify-center gap-2">
                        <span>{translate('categories_title') || (isEL ? 'Κατηγορίες' : 'Categories')}</span>
                        {!isPro && <ProBadge onClick={() => openUpgradeModal('categories')} />}
                    </div>
                }
                subtitle={translate('custom_categories_desc') || (isEL ? 'Διαχείριση κατηγοριών' : 'Categories Management')}
                hideHeader={hideHeader}
            />

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-6">

                    {/* Navigation Breadcrumb (Home > Categories) matching Sure screenshot */}
                    <DesktopBreadcrumb
                        onBack={onBack}
                        parentLabel={translate('categories_breadcrumb_home') || (isEL ? 'Αρχική' : 'Home')}
                        currentLabel={translate('categories_breadcrumb_categories') || (isEL ? 'Κατηγορίες' : 'Categories')}
                    />

                    {/* Page Title & Action Buttons Row */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {translate('categories_title') || (isEL ? 'Κατηγορίες' : 'Categories')}
                            </h1>
                            {!isPro && <ProBadge onClick={() => openUpgradeModal('categories')} />}
                        </div>

                        <div className="flex items-center gap-2 relative" onClick={(e) => e.stopPropagation()}>
                            {/* Header More Menu Button (...) */}
                            <button
                                type="button"
                                onClick={() => setOpenHeaderMenu(!openHeaderMenu)}
                                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                title="More actions"
                                aria-label="More actions"
                            >
                                <MoreHorizontal size={20} />
                            </button>

                            {/* + New Category Executive Button */}
                            <button
                                type="button"
                                aria-label={translate('add_category') || 'add_category'}
                                onClick={handleOpenAddModal}
                                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                            >
                                <Plus size={16} strokeWidth={2.5} className="shrink-0" />
                                <span>{translate('new_category_btn') || (isEL ? 'Νέα κατηγορία' : 'New category')}</span>
                            </button>

                            {/* Dropdown anchored safely to right edge so it never overflows mobile viewport */}
                            {openHeaderMenu && (
                                <div className="absolute right-0 top-full mt-1.5 z-40 w-56 sm:w-60 py-1.5 bg-white dark:bg-surface-dark2 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 animate-fade-in text-xs font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpenHeaderMenu(false);
                                            handleRestoreDefaults();
                                        }}
                                        className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                    >
                                        <RotateCcw size={15} className="shrink-0 text-gray-500" />
                                        <span>{translate('use_defaults_recommended') || (isEL ? 'Χρήση προεπιλογών' : 'Use defaults (recommended)')}</span>
                                    </button>
                                    <div className="my-1 border-t border-gray-100 dark:border-white/[0.06]" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpenHeaderMenu(false);
                                            setPromptDeleteAll(true);
                                        }}
                                        className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={15} className="shrink-0" />
                                        <span>{translate('delete_all_categories') || (isEL ? 'Διαγραφή όλων' : 'Delete all categories')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs Navigation */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="w-full sm:w-auto flex items-center gap-1.5 p-1 rounded-xl bg-gray-200/60 dark:bg-white/[0.06] text-xs font-bold overflow-x-auto no-scrollbar scroll-smooth touch-pan-x">
                            <button
                                type="button"
                                onClick={() => { setMainTab('categories'); setActiveType('all'); }}
                                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                                    mainTab === 'categories' && activeType === 'all'
                                        ? 'bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white shadow-xs'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <span className="whitespace-nowrap shrink-0">{translate('categories_all_tab') || (isEL ? 'Όλες' : 'All')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMainTab('categories'); setActiveType('expense'); }}
                                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                                    mainTab === 'categories' && activeType === 'expense'
                                        ? 'bg-white dark:bg-surface-dark3 text-rose-600 dark:text-rose-400 shadow-xs'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <span className="whitespace-nowrap shrink-0">{translate('categories_expense_tab') || (isEL ? 'Έξοδα' : 'Expenses')}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold shrink-0 ${
                                    mainTab === 'categories' && activeType === 'expense'
                                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                                        : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                                }`}>
                                    {expenseCustom.length}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMainTab('categories'); setActiveType('income'); }}
                                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                                    mainTab === 'categories' && activeType === 'income'
                                        ? 'bg-white dark:bg-surface-dark3 text-emerald-600 dark:text-emerald-400 shadow-xs'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <span className="whitespace-nowrap shrink-0">{translate('categories_income_tab') || (isEL ? 'Έσοδα' : 'Income')}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold shrink-0 ${
                                    mainTab === 'categories' && activeType === 'income'
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                                }`}>
                                    {incomeCustom.length}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMainTab('rules')}
                                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                                    mainTab === 'rules'
                                        ? 'bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white shadow-xs'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <SlidersHorizontal size={13} strokeWidth={2.3} className="shrink-0" />
                                <span className="whitespace-nowrap shrink-0">{translate('merchant_rules_tab') || (isEL ? 'Κανόνες Εμπόρων' : 'Merchant Rules')}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-gray-300/60 dark:bg-white/10 font-bold shrink-0">
                                    {(merchantRules || []).length}
                                </span>
                            </button>
                        </div>
                    </div>

                    {mainTab === 'rules' ? (
                        <div className="bg-white dark:bg-surface-dark2 border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
                            <MerchantRulesManager
                                rules={merchantRules || []}
                                onAdd={addMerchantRule}
                                onEdit={editMerchantRule}
                                onDelete={deleteMerchantRule}
                                onRestoreStarter={resetMerchantRulesToDefault}
                            />
                        </div>
                    ) : (
                        /* Main Sure-Style Structural Card */
                        <div className="bg-white dark:bg-surface-dark2 border border-gray-200/90 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4 min-h-[380px]">
                            {/* Card Overline Header: CATEGORIES · {count} matching Sure screenshot */}
                            <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider uppercase">
                                {isEL ? `ΚΑΤΗΓΟΡΙΕΣ · ${displayedCategories.length}` : `CATEGORIES · ${displayedCategories.length}`}
                            </div>

                            {displayedCategories.length === 0 ? (
                                /* Empty State matching media_1795175362618_85f359d7.png */
                                <div className="py-24 px-4 text-center space-y-5 animate-fade-in flex flex-col items-center justify-center">
                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        {translate('no_categories_found') || (isEL ? 'Δεν βρέθηκαν κατηγορίες' : 'No categories found')}
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 w-full max-w-xs sm:max-w-none">
                                        <button
                                            type="button"
                                            onClick={handleRestoreDefaults}
                                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer text-center"
                                        >
                                            {translate('use_defaults_recommended') || (isEL ? 'Χρήση προεπιλογών (συνιστάται)' : 'Use defaults (recommended)')}
                                        </button>
                                        <button
                                            type="button"
                                            aria-label={translate('add_category') || 'add_category'}
                                            onClick={handleOpenAddModal}
                                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-800 dark:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer text-center"
                                        >
                                            <Plus size={15} strokeWidth={2.5} />
                                            <span>{translate('new_category_btn') || (isEL ? 'Νέα κατηγορία' : 'New category')}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Category Rows List */
                                <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {displayedCategories.map((item) => {
                                        const { name: catName, type: catType } = item;
                                        const count = txCounts[catName] || 0;
                                        const meta = categoryMeta[catName] || {};
                                        const accentColor = meta.color || getCategoryAccent(catName, catType);
                                        const IconComponent = getCategoryIcon(meta.iconId || catName);

                                        return (
                                            <div
                                                key={`${catType}-${catName}`}
                                                className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 group transition-colors -mx-2 px-2 rounded-xl hover:bg-gray-50/60 dark:hover:bg-white/[0.02]"
                                            >
                                                {/* Left: Pill Chip matching screenshot */}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span
                                                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-semibold tracking-tight transition-all shrink-0"
                                                        style={{
                                                            backgroundColor: `${accentColor}18`,
                                                            borderColor: `${accentColor}40`,
                                                            color: accentColor
                                                        }}
                                                    >
                                                        <IconComponent size={15} strokeWidth={2.2} style={{ color: accentColor }} />
                                                        <span>{catName}</span>
                                                    </span>

                                                    {meta.parent && (
                                                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium truncate hidden sm:inline">
                                                            ↳ {meta.parent}
                                                        </span>
                                                    )}

                                                    <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0 ml-1">
                                                        {count === 0
                                                            ? (translate('tx_count_none') || 'Καμία συναλλαγή')
                                                            : count === 1
                                                                ? (translate('tx_count_singular') || '1 συναλλαγή')
                                                                : (translate('tx_count_label', { count }) || `${count} συναλλαγές`)}
                                                    </span>
                                                </div>

                                                {/* Right: Actions (clean single ... button) */}
                                                <div className="flex items-center gap-1 shrink-0 relative" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenRowMenu(openRowMenu === catName ? null : catName)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                                        title="More options"
                                                        aria-label={`More options for ${catName}`}
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>

                                                    {/* Dropdown menu for row matching media_1795181252011_1922dcd8.png */}
                                                    {openRowMenu === catName && (
                                                        <div className="absolute right-0 top-full mt-1.5 z-30 min-w-[170px] w-auto p-1.5 bg-white dark:bg-surface-dark2 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 animate-fade-in text-xs font-semibold">
                                                            <button
                                                                type="button"
                                                                title={translate('edit_category') || 'edit_category'}
                                                                onClick={() => { setOpenRowMenu(null); handleStartEdit(catName, catType); }}
                                                                className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-left rounded-xl text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                                                            >
                                                                <Pencil size={15} className="shrink-0 text-gray-500 dark:text-gray-400" />
                                                                <span>{translate('edit_category') || (isEL ? 'Επεξεργασία κατηγορίας' : 'Edit category')}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                title={translate('delete_category') || 'delete_category'}
                                                                onClick={() => { setOpenRowMenu(null); handlePromptDelete(catName, catType); }}
                                                                className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-left rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer whitespace-nowrap"
                                                            >
                                                                <Trash2 size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
                                                                <span>{translate('delete_category') || (isEL ? 'Διαγραφή κατηγορίας' : 'Delete category')}</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Sure-Style "New Category" / "Edit Category" Modal matching media_1795175343753_0cc2804d.png */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-fade-in"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !isSaving && handleCloseModal()} />
                    <div className="relative z-10 w-full max-w-md bg-white dark:bg-surface-dark2 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-white/10 space-y-5 animate-scale-up">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingCategory
                                    ? (translate('edit_category_modal') || (isEL ? 'Επεξεργασία κατηγορίας' : 'Edit category'))
                                    : (translate('new_category_modal') || (isEL ? 'Νέα κατηγορία' : 'New category'))}
                            </h3>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Centered Avatar Icon Selector with floating pencil badge */}
                        <div className="flex flex-col items-center justify-center pt-1">
                            <div
                                onClick={() => setShowIconPicker(!showIconPicker)}
                                role="button"
                                tabIndex={0}
                                title="Change icon & color"
                                className="w-16 h-16 rounded-full flex items-center justify-center relative cursor-pointer shadow-xs border border-black/5 dark:border-white/10 hover:scale-105 active:scale-95 transition-transform"
                                style={{ backgroundColor: `${formColor}20` }}
                            >
                                {React.createElement(selectedIconComponent, {
                                    size: 28,
                                    style: { color: formColor }
                                })}
                                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300">
                                    <Pencil size={11} strokeWidth={2.3} />
                                </div>
                            </div>

                            {/* Expandable Icon & Color Palette Picker */}
                            {showIconPicker && (
                                <div className="w-full mt-4 p-3.5 rounded-2xl bg-gray-50 dark:bg-surface-dark3 border border-gray-200/80 dark:border-white/10 space-y-3 animate-fade-in">
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        {AVAILABLE_CATEGORY_COLORS.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setFormColor(c)}
                                                className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${formColor === c ? 'scale-125 ring-2 ring-gray-950 dark:ring-white ring-offset-2' : 'hover:scale-110'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>

                                    <div className="max-h-44 overflow-y-auto grid grid-cols-6 gap-2 p-1 custom-scrollbar">
                                        {AVAILABLE_CATEGORY_ICONS.map(item => {
                                            const isSelected = formIconId === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormIconId(item.id);
                                                        setShowIconPicker(false);
                                                    }}
                                                    className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-gray-200 dark:bg-white/20'
                                                            : 'hover:bg-gray-200/50 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
                                                    }`}
                                                    style={{ color: isSelected ? formColor : undefined }}
                                                    title={item.name}
                                                >
                                                    {React.createElement(item.icon, { size: 18 })}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Form Inputs */}
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {/* Name * */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    {translate('name_required') || 'Name'} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder={translate('category_name_placeholder') || 'Category name'}
                                    maxLength={40}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark3 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-950 dark:focus:ring-white transition-all shadow-xs"
                                />
                            </div>

                            {/* Parent Category (optional) */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    {translate('parent_category_optional') || 'Parent category (optional)'}
                                </label>
                                <CustomSelect
                                    value={formParent}
                                    onChange={setFormParent}
                                    options={[
                                        { value: '', label: translate('unassigned') || '(unassigned)' },
                                        ...availableParentOptions.map(p => ({
                                            value: p,
                                            label: p,
                                            icon: <CategoryIcon category={p} size={15} />
                                        }))
                                    ]}
                                />
                            </div>

                            {/* Type Toggle (when in All view) */}
                            {activeType === 'all' && !editingCategory && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        {isEL ? 'Τύπος' : 'Type'}
                                    </label>
                                    <div className="flex rounded-xl bg-gray-100 dark:bg-white/[0.06] p-1">
                                        <button
                                            type="button"
                                            onClick={() => setFormType('expense')}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                formType === 'expense'
                                                    ? 'bg-white dark:bg-surface-dark3 text-rose-600 shadow-xs'
                                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {translate('categories_expense_tab') || 'Expenses'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormType('income')}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                formType === 'income'
                                                    ? 'bg-white dark:bg-surface-dark3 text-emerald-600 shadow-xs'
                                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {translate('categories_income_tab') || 'Income'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                title={translate('save') || 'save'}
                                disabled={!formName.trim() || isSaving}
                                className="w-full py-3 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 font-bold rounded-xl shadow-sm transition-all active:scale-95 text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>
                                        {editingCategory
                                            ? (translate('save_changes') || (isEL ? 'Αποθήκευση' : 'Save Changes'))
                                            : (translate('create_category') || (isEL ? 'Δημιουργία Κατηγορίας' : 'Create Category'))}
                                    </span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Modal with Reassignment Target */}
            {deleteTarget && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center animate-fade-in p-0 sm:p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !isDeleting && setDeleteTarget(null)} />
                    <div className="relative z-10 w-full max-w-md bg-white dark:bg-surface-dark2 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl space-y-5 border border-gray-200 dark:border-white/10 m-0 sm:m-4">
                        <div className="flex items-center gap-3">
                            <Trash2 size={24} className="text-rose-600 dark:text-rose-400 shrink-0" strokeWidth={2.3} />
                            <div>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                                    {translate('delete_category') || 'Διαγραφή Κατηγορίας'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    «{deleteTarget.name}»
                                </p>
                            </div>
                        </div>

                        {deleteTarget.txCount > 0 ? (
                            <div className="space-y-4">
                                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2.5">
                                    <ArrowRightLeft size={16} className="shrink-0 mt-0.5" />
                                    <span>
                                        {translate('delete_category_has_txs', { category: deleteTarget.name, count: deleteTarget.txCount }) ||
                                            `Η κατηγορία «${deleteTarget.name}» συνδέεται με ${deleteTarget.txCount} συναλλαγές.`}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                        {translate('reassign_to_label') || 'Μεταφορά συναλλαγών στην κατηγορία:'}
                                    </label>
                                    <CustomSelect
                                        value={deleteTarget.reassignTo}
                                        onChange={(val) => setDeleteTarget({ ...deleteTarget, reassignTo: val })}
                                        options={availableReassignTargets.map(target => ({
                                            value: target,
                                            label: target,
                                            icon: <CategoryIcon category={target} type={deleteTarget.type || activeType} size={16} />
                                        }))}
                                    />
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                                        {translate('reassign_desc') || 'Όλες οι υπάρχουσες συναλλαγές θα μεταφερθούν αυτόματα στην επιλεγμένη κατηγορία χωρίς απώλεια δεδομένων.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                {translate('delete_category_confirm', { category: deleteTarget.name }) ||
                                    `Είστε βέβαιοι ότι θέλετε να διαγράψετε την κατηγορία «${deleteTarget.name}»;`}
                            </p>
                        )}

                        <div className="flex gap-2.5 pt-1">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-center cursor-pointer"
                            >
                                {translate('cancel') || 'Ακύρωση'}
                            </button>
                            <button
                                type="button"
                                id="confirm-delete-category-btn"
                                data-testid="confirm-delete-category-btn"
                                disabled={isDeleting}
                                onClick={handleConfirmDelete}
                                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm shadow-rose-600/30 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                {isDeleting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        <span>{translate('delete') || 'Διαγραφή'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete All Custom Categories Confirmation Dialog */}
            {promptDeleteAll && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-fade-in"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !isDeletingAll && setPromptDeleteAll(false)} />
                    <div className="relative z-10 w-full max-w-sm bg-white dark:bg-surface-dark2 rounded-2xl p-6 shadow-2xl space-y-4 border border-gray-200 dark:border-white/10 animate-scale-up">
                        <div className="flex items-center gap-3">
                            <Trash2 size={24} className="text-rose-600 dark:text-rose-400 shrink-0" strokeWidth={2.3} />
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                                {translate('delete_all_categories') || (isEL ? 'Διαγραφή όλων' : 'Delete all categories')}
                            </h3>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                            {translate('delete_all_categories_confirm') || (isEL ? 'Είστε βέβαιοι ότι θέλετε να διαγράψετε όλες τις προσαρμοσμένες κατηγορίες;' : 'Are you sure you want to delete all custom categories?')}
                        </p>
                        <div className="flex gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={isDeletingAll}
                                onClick={() => setPromptDeleteAll(false)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-center cursor-pointer"
                            >
                                {translate('cancel') || 'Ακύρωση'}
                            </button>
                            <button
                                type="button"
                                disabled={isDeletingAll}
                                onClick={handleConfirmDeleteAll}
                                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                {isDeletingAll ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>{translate('delete') || 'Διαγραφή'}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CategoriesSettingsView;