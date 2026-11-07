import React, { useState, useEffect, useRef } from 'react';
import {
    Mail,
    Lock,
    Languages,
    ArrowRight,
    ArrowLeft,
    Eye,
    EyeOff,
    X,
    Check,
    ShieldCheck,
    KeyRound,
    HelpCircle
} from 'lucide-react';
import { supabase } from '../supabase';
import { useSettings } from '../contexts/SettingsContext';
import { Capacitor } from '@capacitor/core';
import { validateEmail } from '../utils/emailValidation';
import PasswordInput from '../components/PasswordInput';
import { motion, AnimatePresence } from 'framer-motion';

const LoginView = ({
    onEmailLogin,
    onRegister,
    onGoogleLogin,
    onVerifyOtp,
    onResendOtp,
    isVerifying,
    onCancelVerification,
    onCompleteVerification
}) => {
    const { t, language, updateLanguage } = useSettings();
    const [pendingPlan] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const plan = params.get('plan') || params.get('upgrade') || sessionStorage.getItem('pending_upgrade_plan') || localStorage.getItem('pending_upgrade_plan');
            if (plan === 'yearly' || plan === 'monthly') return plan;
        }
        return null;
    });
    const [isLogin, setIsLogin] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const plan = params.get('plan') || params.get('upgrade') || sessionStorage.getItem('pending_upgrade_plan') || localStorage.getItem('pending_upgrade_plan');
            if (plan) return false; // Default to register tab when arriving with upgrade intent
        }
        return true;
    });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);

    // Verification State
    const [showVerification, setShowVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(0);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isCodeError, setIsCodeError] = useState(false);
    const codeRefs = useRef([]);
    const completionTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
        };
    }, []);

    // Sync with App-level verification state
    useEffect(() => {
        if (isVerifying) {
            setShowVerification(true);
            if (email && !verificationEmail) {
                setVerificationEmail(email);
            }
        }
    }, [isVerifying, email]);

    const verifyCode = async (codeToVerify) => {
        if (isVerifyingCode || isVerified) return;
        if (!codeToVerify || codeToVerify.length !== 6) return;

        setIsVerifyingCode(true);
        setIsCodeError(false);

        try {
            await onVerifyOtp(verificationEmail, codeToVerify);
            setIsVerified(true);
            setIsVerifyingCode(false);

            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try {
                    navigator.vibrate([20, 30, 20]);
                } catch {
                    // Ignore haptic error if unsupported
                }
            }

            completionTimerRef.current = setTimeout(() => {
                if (onCompleteVerification) {
                    onCompleteVerification();
                } else if (onCancelVerification) {
                    onCancelVerification();
                }
            }, 1250);
        } catch (err) {
            setIsVerifyingCode(false);
            setIsCodeError(true);
            setVerificationCode(['', '', '', '', '', '']);
            setTimeout(() => {
                codeRefs.current[0]?.focus();
            }, 60);
        }
    };

    const handleCodeChange = (idx, val) => {
        if (isVerifyingCode || isVerified) return;
        if (!/^\d*$/.test(val)) return;
        if (isCodeError) setIsCodeError(false);

        const newCode = [...verificationCode];
        newCode[idx] = val.slice(-1);
        setVerificationCode(newCode);

        // Auto-focus next
        if (val && idx < 5) {
            codeRefs.current[idx + 1]?.focus();
        }

        // Auto-submit if all 6 filled
        if (newCode.every(v => v !== '') && val) {
            const finalCode = newCode.join('');
            verifyCode(finalCode);
        }
    };

    const handleKeyDown = (idx, e) => {
        if (isVerifyingCode || isVerified) return;
        if (e.key === 'Backspace' && !verificationCode[idx] && idx > 0) {
            codeRefs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        if (isVerifyingCode || isVerified) return;
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        const digits = pastedData.replace(/\D/g, '').slice(0, 6);

        if (digits.length > 0) {
            if (isCodeError) setIsCodeError(false);
            const newCode = [...verificationCode];
            digits.split('').forEach((digit, i) => {
                if (i < 6) newCode[i] = digit;
            });
            setVerificationCode(newCode);

            const nextIdx = Math.min(digits.length, 5);
            codeRefs.current[nextIdx]?.focus();

            if (digits.length === 6) {
                verifyCode(digits);
            }
        }
    };

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    const handleResend = async () => {
        if (resendTimer > 0) return;
        await onResendOtp(verificationEmail || email);
        setResendTimer(60);
    };

    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetStatus, setResetStatus] = useState({ loading: false, success: false, error: '' });
    const [formError, setFormError] = useState('');
    const [gsiFailed, setGsiFailed] = useState(false);
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

    const isMobileOrIOS = typeof window !== 'undefined' && (
        Capacitor.isNativePlatform() ||
        /iPad|iPhone|iPod|Android/i.test(navigator.userAgent || '') ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
        Boolean(window.navigator.standalone) ||
        (/^((?!chrome|android).)*safari/i.test(navigator.userAgent || ''))
    );

    const handleGoogleClick = async () => {
        if (isGoogleSubmitting) return;
        setIsGoogleSubmitting(true);
        try {
            await onGoogleLogin();
        } catch (err) {
            setIsGoogleSubmitting(false);
        }
    };

    // Detect & maintain the GSI button when returning to the choice screen (Desktop only)
    useEffect(() => {
        if (isMobileOrIOS) return;
        if (showEmailForm || showVerification) return;

        const checkGsi = () => {
            const container = document.getElementById('google-signin-button');
            if (container) {
                if (container.children.length === 0) {
                    if (typeof window.__renderGoogleButton === 'function') {
                        window.__renderGoogleButton();
                    }
                } else {
                    setGsiFailed(false);
                }
            }
        };

        checkGsi();
        const t1 = setTimeout(checkGsi, 100);
        const t2 = setTimeout(checkGsi, 400);

        const failTimer = setTimeout(() => {
            const container = document.getElementById('google-signin-button');
            if (container && container.children.length === 0) {
                setGsiFailed(true);
            }
        }, 2500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(failTimer);
        };
    }, [showEmailForm, showVerification, isMobileOrIOS]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!email || !password) return;

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            if (!isLogin || emailValidation.errorKey === 'invalid_email_format') {
                setFormError(t(emailValidation.errorKey) || 'Μη έγκυρη διεύθυνση email');
                return;
            }
        }
        if (!isLogin && password.length < 8) {
            setFormError(t('password_length_error') || 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες');
            return;
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await onEmailLogin(email, password);
            } else {
                await onRegister(email, password);
                setVerificationEmail(email);
                setIsVerified(false);
                setIsVerifyingCode(false);
                setIsCodeError(false);
                setShowVerification(true);
            }
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            let msg = (t('error_prefix') || 'Σφάλμα: ') + (err.message || t('something_went_wrong') || 'Κάτι πήγε στραβά');
            if (err.message?.includes('Invalid login credentials') || err.message?.includes('invalid_credentials')) {
                msg = t('wrong_password') || 'Λάθος email ή κωδικός πρόσβασης';
            } else if (err.message?.includes('already registered') || err.message?.includes('User already registered')) {
                msg = t('email_in_use') || 'Το email χρησιμοποιείται ήδη';
            } else if (err.status === 429 || err.message?.includes('too many requests')) {
                msg = t('rate_limit_error') || 'Πάρα πολλά αιτήματα. Δοκιμάστε αργότερα.';
            }
            setFormError(msg);
        }
    };

    const handleVerify = (e) => {
        if (e) e.preventDefault();
        const code = verificationCode.join('');
        verifyCode(code);
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        const trimmedEmail = resetEmail.trim().toLowerCase();
        if (!trimmedEmail) return;
        setResetStatus({ loading: true, success: false, error: '' });
        try {
            const appOrigin = window.location.hostname.startsWith('app.')
                ? window.location.origin
                : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                    ? window.location.origin
                    : 'https://app.spendlore.gr';

            const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
                redirectTo: `${appOrigin}/?app=1`
            });
            if (error) throw error;
            setResetStatus({ loading: false, success: true, error: '' });
            setTimeout(() => {
                setShowForgotModal(false);
                setResetStatus({ loading: false, success: false, error: '' });
                setResetEmail('');
            }, 3000);
        } catch (error) {
            console.error('Password reset error:', error);
            let msg = t('email_send_error') || 'Σφάλμα αποστολής email.';
            const errMsg = (error.message || '').toLowerCase();
            if (errMsg.includes('not found') || errMsg.includes('user not found')) {
                msg = t('user_not_found') || 'Δεν υπάρχει χρήστης με αυτό το email.';
            } else if (errMsg.includes('rate limit') || error.status === 429 || errMsg.includes('too many') || errMsg.includes('frequency')) {
                msg = t('rate_limit_error') || 'Πάρα πολλές προσπάθειες. Παρακαλώ περιμένετε λίγα λεπτά πριν ξαναδοκιμάσετε.';
            } else if (error.status === 500 || errMsg.includes('recovery email') || error.code === 'unexpected_failure') {
                msg = t('recovery_email_service_error') || 'Αδυναμία αποστολής email επαναφοράς. Ελέγξτε ότι το email είναι σωστό ή δοκιμάστε ξανά σε λίγο.';
            } else if (error.message) {
                msg = error.message;
            }
            setResetStatus({ loading: false, success: false, error: msg });
        }
    };

    return (
        <div className="min-h-[100dvh] w-full flex flex-col items-center justify-between relative overflow-y-auto overflow-x-hidden bg-[#08070D] px-4 py-8 sm:py-12 selection:bg-violet-500/30 dark-autofill">

            {/* Micro Dot Matrix Grid */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.08]"
                style={{
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Center Content Container */}
            <div className="w-full max-w-[420px] my-auto py-2 z-10 relative flex flex-col items-center">
            {/* Discrete Language Switcher */}
            <div className="absolute top-2 right-2 sm:-top-2 sm:-right-4 z-20">
                <button
                    type="button"
                    onClick={() => updateLanguage(language === 'el' ? 'en' : 'el')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all backdrop-blur-md cursor-pointer"
                    title={language === 'el' ? 'Switch to English' : 'Αλλαγή σε Ελληνικά'}
                >
                    <Languages size={13} className="text-gray-400" />
                    <span>{language === 'el' ? 'EN' : 'ΕΛ'}</span>
                </button>
            </div>

                {/* ── Brand Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col items-center text-center mb-6 sm:mb-8"
                >
                    {/* App Icon */}
                    <div className="relative cursor-pointer mb-3.5">
                        <div className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-2xl bg-white/10 border border-white/15 p-3.5 shadow-sm flex items-center justify-center">
                            <img
                                src="/spendlore-mark.png"
                                alt="Spendlore Icon"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* App Title & Subtitle */}
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-outfit">
                        Spendlore
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1 text-center max-w-[280px]">
                        {showVerification
                            ? (isVerified
                                ? (t('verification_successful') || 'Επιτυχής Επαλήθευση!')
                                : (t('verification_title') || 'Επαλήθευση ασφαλείας'))
                            : (isLogin
                                ? (t('login_welcome_back') || 'Καλωσήρθες πίσω')
                                : (t('register_subtitle') || 'Δημιούργησε λογαριασμό σε 30 δευτερόλεπτα'))}
                    </p>
                </motion.div>

                {/* ── Main Auth Card ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
                    className="w-full bg-[#111018] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden"
                >

                    <AnimatePresence mode="wait">
                        {/* ── OTP Verification Flow ── */}
                        {showVerification ? (
                            <motion.div
                                key="verification-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={
                                    isVerified
                                        ? { opacity: [1, 1, 0.2], scale: [1, 1, 0.98] }
                                        : { opacity: 1, x: 0 }
                                }
                                exit={{ opacity: 0, x: -20 }}
                                transition={
                                    isVerified
                                        ? { duration: 1.25, times: [0, 0.82, 1] }
                                        : { duration: 0.25 }
                                }
                                className="space-y-6"
                            >
                                <button
                                    type="button"
                                    disabled={isVerifyingCode || isVerified}
                                    onClick={() => {
                                        setShowVerification(false);
                                        setIsVerified(false);
                                        setIsVerifyingCode(false);
                                        setIsCodeError(false);
                                        setVerificationCode(['', '', '', '', '', '']);
                                        if (onCancelVerification) onCancelVerification();
                                    }}
                                    className={`flex items-center gap-2 text-xs font-bold transition-opacity duration-200 ${
                                        isVerifyingCode || isVerified
                                            ? 'opacity-0 pointer-events-none'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <ArrowLeft size={16} /> {t('back') || 'Πίσω'}
                                </button>

                                <div className="text-center space-y-2">
                                    <div className="relative flex items-center justify-center w-14 h-14 mx-auto mb-1">
                                        <AnimatePresence mode="wait">
                                            {isVerified ? (
                                                <motion.div
                                                    key="verified-icon"
                                                    initial={{ scale: 0.7, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                                                    className="relative flex items-center justify-center"
                                                >
                                                    {/* Expanding subtle ripple ring */}
                                                    <motion.div
                                                        initial={{ scale: 0.8, opacity: 0.8 }}
                                                        animate={{ scale: 1.55, opacity: 0 }}
                                                        transition={{ duration: 0.65, ease: "easeOut" }}
                                                        className="absolute w-12 h-12 rounded-full border border-emerald-500/50 pointer-events-none"
                                                    />

                                                    {/* Pure SVG Vector Drawn Circle + Checkmark */}
                                                    <svg viewBox="0 0 52 52" className="w-12 h-12 text-emerald-400" fill="none">
                                                        <motion.circle
                                                            cx="26"
                                                            cy="26"
                                                            r="23"
                                                            stroke="currentColor"
                                                            strokeWidth="2.5"
                                                            initial={{ pathLength: 0, opacity: 0 }}
                                                            animate={{ pathLength: 1, opacity: 1 }}
                                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                                        />
                                                        <motion.path
                                                            stroke="currentColor"
                                                            strokeWidth="3.2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15 27l7.5 7.5L37 18"
                                                            initial={{ pathLength: 0 }}
                                                            animate={{ pathLength: 1 }}
                                                            transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
                                                        />
                                                    </svg>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="idle-icon"
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={
                                                        isVerifyingCode
                                                            ? { scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }
                                                            : { scale: 1, opacity: 1 }
                                                    }
                                                    transition={
                                                        isVerifyingCode
                                                            ? { repeat: Infinity, duration: 1.1, ease: "easeInOut" }
                                                            : { duration: 0.2 }
                                                    }
                                                    className="flex items-center justify-center"
                                                >
                                                    <ShieldCheck size={32} className="text-white/80" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {isVerified ? (
                                            <motion.div
                                                key="verified-copy"
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="space-y-1.5"
                                            >
                                                <h2 className="text-lg font-bold text-white tracking-tight">
                                                    {t('verification_successful') || 'Επιτυχής Επαλήθευση!'}
                                                </h2>
                                                <p className="text-xs text-emerald-400/90 font-medium leading-relaxed px-2">
                                                    {t('verification_redirecting') || 'Ο λογαριασμός σας επιβεβαιώθηκε. Είσοδος...'}
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="idle-copy"
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                transition={{ duration: 0.2 }}
                                                className="space-y-1.5"
                                            >
                                                <h2 className="text-lg font-bold text-white tracking-tight">
                                                    {t('verification_code') || 'Κωδικός Επιβεβαίωσης'}
                                                </h2>
                                                <p className="text-xs text-gray-400 leading-relaxed px-2">
                                                    {(t('check_email_for_code') || 'Σου στείλαμε έναν 6-ψήφιο κωδικό στο {email}.').replace('{email}', verificationEmail)}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <motion.div
                                    animate={
                                        isCodeError
                                            ? { x: [-8, 8, -6, 6, -3, 3, 0] }
                                            : {}
                                    }
                                    transition={{ duration: 0.4 }}
                                    className="flex justify-center gap-2 sm:gap-2.5 py-3"
                                >
                                    {verificationCode.map((digit, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={false}
                                            animate={
                                                isVerified
                                                    ? {
                                                        scale: [1, 1.1, 1],
                                                        transition: {
                                                            delay: idx * 0.04,
                                                            duration: 0.3,
                                                            ease: "easeOut"
                                                        }
                                                    }
                                                    : isVerifyingCode
                                                        ? {
                                                            opacity: [1, 0.7, 1],
                                                            transition: {
                                                                repeat: Infinity,
                                                                duration: 1.1,
                                                                delay: idx * 0.07
                                                            }
                                                        }
                                                        : { scale: 1, opacity: 1 }
                                            }
                                            className="relative"
                                        >
                                            <input
                                                ref={el => codeRefs.current[idx] = el}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                disabled={isVerifyingCode || isVerified}
                                                onChange={e => handleCodeChange(idx, e.target.value)}
                                                onKeyDown={e => handleKeyDown(idx, e)}
                                                onPaste={handlePaste}
                                                aria-label={`Digit ${idx + 1}`}
                                                className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl outline-none transition-all duration-200 ${
                                                    isVerified
                                                        ? 'bg-emerald-500/10 border border-emerald-500/70 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                                        : isCodeError
                                                            ? 'bg-rose-500/10 border border-rose-500/70 text-rose-300'
                                                            : 'bg-white/[0.05] border border-white/10 text-white focus:border-white focus:bg-white/10 focus:ring-1 focus:ring-white shadow-xs'
                                                }`}
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>

                                <AnimatePresence>
                                    {isCodeError && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="text-xs font-semibold text-rose-400 text-center -mt-2"
                                        >
                                            {t('invalid_code') || 'Μη έγκυρος κωδικός. Δοκιμάστε ξανά.'}
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    whileHover={!(isVerifyingCode || isVerified || verificationCode.some(d => !d)) ? { scale: 1.01 } : {}}
                                    whileTap={!(isVerifyingCode || isVerified || verificationCode.some(d => !d)) ? { scale: 0.98 } : {}}
                                    onClick={handleVerify}
                                    disabled={isVerifyingCode || isVerified || verificationCode.some(d => !d)}
                                    className={`w-full py-3 rounded-xl font-bold text-sm relative overflow-hidden flex items-center justify-center gap-2 transition-all duration-300 ${
                                        isVerified
                                            ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                            : isVerifyingCode
                                                ? 'bg-white/90 text-gray-950 cursor-wait'
                                                : 'bg-white hover:bg-gray-100 text-gray-950 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed'
                                    }`}
                                >
                                    {isVerified ? (
                                        <motion.div
                                            key="btn-verified"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center justify-center gap-2"
                                        >
                                            <motion.div
                                                initial={{ scale: 0, rotate: -45 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                            >
                                                <Check size={18} className="stroke-[2.5]" />
                                            </motion.div>
                                            <span>{t('verified_btn') || 'Επιβεβαιώθηκε'}</span>
                                        </motion.div>
                                    ) : isVerifyingCode ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
                                            <span>{t('sending') || 'Επαλήθευση...'}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>{t('verify_btn') || 'Επιβεβαίωση'}</span>
                                            <ArrowRight size={16} />
                                        </>
                                    )}

                                    {/* Micro progress line filling on success */}
                                    {isVerified && (
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 1.2, ease: "linear" }}
                                            className="absolute bottom-0 left-0 h-[2px] bg-white/50"
                                        />
                                    )}
                                </motion.button>

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        disabled={resendTimer > 0 || isVerifyingCode || isVerified}
                                        className="text-xs font-bold text-violet-400 hover:text-violet-300 disabled:opacity-50 disabled:no-underline transition-colors"
                                        onClick={handleResend}
                                    >
                                        {resendTimer > 0
                                            ? `${t('resend_code') || 'Επαναποστολή κωδικού'} (${resendTimer}s)`
                                            : (t('resend_code') || 'Επαναποστολή κωδικού')}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            /* ── Main Auth Flow (Tabs + Social / Email) ── */
                            <motion.div
                                key="auth-main-view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* ── Pending Upgrade Intent Banner ── */}
                                {pendingPlan && (
                                    <div className="mb-5 p-3.5 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center gap-3 text-left">
                                        <ShieldCheck size={20} className="text-violet-400 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-white leading-tight">
                                                {pendingPlan === 'yearly'
                                                    ? (t('upgrade_banner_yearly') !== 'upgrade_banner_yearly' ? t('upgrade_banner_yearly') : 'Pro Ετήσιο · 7 ημέρες δωρεάν δοκιμή')
                                                    : (t('upgrade_banner_monthly') !== 'upgrade_banner_monthly' ? t('upgrade_banner_monthly') : 'Pro Μηνιαίο · 7 ημέρες δωρεάν δοκιμή')}
                                            </p>
                                            <p className="text-[11px] text-violet-200/80 mt-0.5 leading-snug">
                                                {t('upgrade_banner_sub') !== 'upgrade_banner_sub'
                                                    ? t('upgrade_banner_sub')
                                                    : 'Συνδέσου ή δημιούργησε λογαριασμό για να συνεχίσεις στο Stripe Checkout.'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ── Segmented Control (Σύνδεση | Εγγραφή) ── */}
                                <div className="bg-white/[0.05] p-1.5 rounded-2xl flex relative border border-white/[0.08] mb-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(true);
                                            setFormError('');
                                        }}
                                        className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold relative z-10 transition-colors ${isLogin ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                    >
                                        {isLogin && (
                                            <motion.div
                                                layoutId="auth-tab-pill"
                                                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                                                className="absolute inset-0 bg-white/15 border border-white/10 rounded-xl shadow-xs"
                                                style={{ zIndex: -1 }}
                                            />
                                        )}
                                        {t('login_tab') || 'Σύνδεση'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(false);
                                            setFormError('');
                                        }}
                                        className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold relative z-10 transition-colors ${!isLogin ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                    >
                                        {!isLogin && (
                                            <motion.div
                                                layoutId="auth-tab-pill"
                                                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                                                className="absolute inset-0 bg-white/15 border border-white/10 rounded-xl shadow-xs"
                                                style={{ zIndex: -1 }}
                                            />
                                        )}
                                        {t('register_tab') || 'Εγγραφή'}
                                    </button>
                                </div>

                                {/* ── View A: Quick Choice (Google & Email Entry) ── */}
                                {/* Kept permanently mounted in DOM so Google's rendered button iframe is preserved */}
                                <div className={showEmailForm ? 'hidden' : 'space-y-4 animate-fade-in'}>
                                    {isMobileOrIOS || gsiFailed ? (
                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            disabled={isGoogleSubmitting}
                                            onClick={handleGoogleClick}
                                            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl 
                                                             border border-white/20 bg-white text-gray-900 font-bold text-sm 
                                                             shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all disabled:opacity-75"
                                        >
                                            {isGoogleSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                            )}
                                            <span>
                                                {isGoogleSubmitting
                                                    ? (t('signing_in') || 'Σύνδεση...')
                                                    : (isLogin ? (t('continue_google_login') || 'Σύνδεση με Google') : (t('continue_google_register') || 'Εγγραφή με Google'))}
                                            </span>
                                        </motion.button>
                                    ) : (
                                        <div
                                            id="google-signin-button"
                                            className="w-full flex items-center justify-center rounded-2xl overflow-hidden min-h-[44px]"
                                        />
                                    )}

                                    {/* Modern Divider */}
                                    <div className="flex items-center gap-3 my-5">
                                        <div className="flex-1 h-px bg-white/10" />
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                            {t('or_divider') || 'ή'}
                                        </span>
                                        <div className="flex-1 h-px bg-white/10" />
                                    </div>

                                    {/* Email Action Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={() => setShowEmailForm(true)}
                                        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl
                                                         bg-white/[0.08] hover:bg-white/[0.12]
                                                         border border-white/15 hover:border-white/25
                                                         text-white font-bold text-sm
                                                         shadow-sm transition-all"
                                    >
                                        <Mail size={18} className="text-violet-400" />
                                        <span>{isLogin ? (t('continue_email_login') || 'Σύνδεση με Email') : (t('continue_email_register') || 'Εγγραφή με Email')}</span>
                                    </motion.button>
                                </div>
                                {/* ── View B: Email & Password Form ── */}
                                <div className={!showEmailForm ? 'hidden' : 'space-y-4 animate-fade-in'}>
                                    {/* Header with Back Button */}
                                    <div className="flex items-center justify-between mb-5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEmailForm(false);
                                                setFormError('');
                                            }}
                                            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors group"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                                                <ArrowLeft size={14} />
                                            </div>
                                            <span>{t('back') || 'Πίσω'}</span>
                                        </button>
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                            {isLogin ? (t('sign_in_header') || 'Είσοδος') : (t('new_account_header') || 'Νέος Λογαριασμός')}
                                        </span>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Email Input */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1.5 tracking-wide text-left">
                                                Email
                                            </label>
                                            <div className="relative group">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" size={17} />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={e => { setEmail(e.target.value); setFormError(''); }}
                                                    placeholder={t('email_placeholder') || 'youremail@gmail.com'}
                                                    required
                                                    autoComplete="email"
                                                    autoCapitalize="none"
                                                    spellCheck="false"
                                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium
                                                                     bg-white/[0.05] hover:bg-white/[0.07] focus:bg-white/[0.08]
                                                                     border border-white/10 focus:border-violet-500
                                                                     focus:ring-4 focus:ring-violet-500/15
                                                                     text-white placeholder:text-gray-500
                                                                     outline-none transition-all duration-200"
                                                />
                                            </div>
                                        </div>

                                        {/* Password Input */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-xs font-semibold text-gray-300 tracking-wide text-left">
                                                    {t('password') || 'Κωδικός'}
                                                </label>
                                                {!isLogin && (
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {t('min_8_chars') || 'Ελάχ. 8 χαρακτήρες'}
                                                    </span>
                                                )}
                                            </div>
                                            <PasswordInput
                                                value={password}
                                                onChange={e => { setPassword(e.target.value); setFormError(''); }}
                                                placeholder={t('password_placeholder') || '••••••••'}
                                                icon={Lock}
                                                iconClassName="text-gray-400 group-focus-within:text-violet-400"
                                                required
                                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                                inputClassName="w-full pl-11 pr-11 py-3.5 rounded-2xl text-sm font-medium bg-white/[0.05] hover:bg-white/[0.07] focus:bg-white/[0.08] border border-white/10 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 text-white placeholder:text-gray-500 outline-none transition-all duration-200"
                                            />
                                        </div>

                                        {/* Error banner */}
                                        {formError && (
                                            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-2xl flex flex-col gap-2 animate-fade-in">
                                                <span>{formError}</span>
                                                {formError === (t('email_in_use') || 'Το email χρησιμοποιείται ήδη.') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsLogin(true);
                                                            setFormError('');
                                                        }}
                                                        className="text-violet-400 font-bold hover:underline self-start mt-0.5"
                                                    >
                                                        {t('login_now') || 'Σύνδεση τώρα'}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Remember Me & Forgot Password */}
                                        {isLogin && (
                                            <div className="flex items-center justify-between pt-1">
                                                <label
                                                    className="flex items-center gap-2 cursor-pointer group select-none"
                                                    onClick={() => setRememberMe(!rememberMe)}
                                                >
                                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${rememberMe
                                                        ? 'bg-violet-600 border-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]'
                                                        : 'border-white/20 bg-white/5 group-hover:border-violet-400'
                                                        }`}>
                                                        {rememberMe && <Check size={11} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                                                        {t('remember_me') || 'Να με θυμάσαι'}
                                                    </span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowForgotModal(true)}
                                                    className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                                                >
                                                    {t('forgot_password') || 'Ξέχασες τον κωδικό;'}
                                                </button>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3.5 rounded-xl font-bold text-sm text-gray-950
                                                             bg-white hover:bg-gray-100
                                                             shadow-xs
                                                             flex items-center justify-center gap-2
                                                             transition-all duration-150 mt-2
                                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <span>
                                                        {isLogin ? (t('login_btn') || 'Σύνδεση') : (t('register_btn') || 'Δημιουργία Λογαριασμού')}
                                                    </span>
                                                    <ArrowRight size={16} />
                                                </>
                                            )}
                                        </motion.button>
                                    </form>
                                </div>

                                {/* Footer Toggle (Δεν έχεις λογαριασμό; / Έχεις ήδη;) */}
                                <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
                                    <p className="text-xs sm:text-sm text-gray-400 font-medium">
                                        {isLogin ? (t('dont_have_account') || "Δεν έχεις λογαριασμό;") : (t('already_have_account') || "Έχεις ήδη λογαριασμό;")}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsLogin(!isLogin);
                                                setFormError('');
                                            }}
                                            className="ml-2 font-bold text-violet-400 hover:text-violet-300 hover:underline transition-colors"
                                        >
                                            {isLogin ? (t('register_tab') || "Εγγραφή") : (t('login_tab') || "Σύνδεση")}
                                        </button>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

            </div>

            {/* ── Forgot Password Bottom Sheet / Modal ── */}
            <AnimatePresence>
                {showForgotModal && (
                    <div key="forgot-password-modal-container" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-md"
                            onClick={() => setShowForgotModal(false)}
                        />

                        {/* Sheet Container */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                            className="relative z-10 w-full max-w-md
                                     bg-[#161424] text-white
                                     rounded-t-2xl sm:rounded-2xl p-6 sm:p-7
                                     border-t sm:border border-white/10
                                     shadow-2xl"
                        >
                            {/* Sheet Handle */}
                            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5 sm:hidden" />

                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2.5">
                                    <KeyRound size={20} className="text-violet-400 shrink-0" />
                                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                                        {t('reset_password') || 'Επαναφορά Κωδικού'}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(false)}
                                    className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {resetStatus.success ? (
                                <div className="text-center py-6 space-y-2">
                                    <Check size={32} className="text-emerald-400 mx-auto mb-3" />
                                    <p className="font-bold text-white text-base">
                                        {t('email_sent_title') || 'Στάλθηκε!'}
                                    </p>
                                    <p className="text-xs text-gray-400 leading-relaxed max-w-[280px] mx-auto">
                                        {t('email_sent_desc') || 'Ελέγξε τα εισερχόμενά σου για τον σύνδεσμο επαναφοράς.'}
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleForgotPassword} className="space-y-4">
                                    <p className="text-xs text-gray-400 leading-relaxed text-left">
                                        {t('reset_email_instruction') || 'Εισάγετε το email σας για να λάβετε σύνδεσμο επαναφοράς.'}
                                    </p>
                                    {resetStatus.error && (
                                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
                                            {resetStatus.error}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1.5 text-left">
                                            Email
                                        </label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" size={17} />
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={e => setResetEmail(e.target.value)}
                                                placeholder={t('email_placeholder') || 'youremail@gmail.com'}
                                                required
                                                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium
                                                         bg-white/[0.05] hover:bg-white/[0.07] focus:bg-white/[0.08]
                                                         border border-white/10 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15
                                                         text-white placeholder:text-gray-500
                                                         outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={resetStatus.loading}
                                        className="w-full py-3 rounded-xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-sm shadow-xs transition-all duration-150 disabled:opacity-50"
                                    >
                                        {resetStatus.loading ? (t('sending') || 'Αποστολή...') : (t('send_link') || 'Αποστολή Συνδέσμου')}
                                    </motion.button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoginView;
