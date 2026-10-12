import React, { useState, useEffect } from 'react';
import { usePos } from '../../context/PosContext';
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  QrCode,
  CreditCard,
  Check,
  Languages,
  Sun,
  Moon,
  UploadCloud,
  FileCheck,
  Lock,
  User,
  BadgeCheck,
  Zap,
  Clock,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { Tooltip, MenuItem } from '@mui/material';
import { PosInput, PosSelect, PosButton, LiquidBackground } from '../common';
import manAvatar from '../../assets/man.png';
import womanAvatar from '../../assets/woman.jpg';

interface RegisterScreenProps {
  onBackToLogin: (prefilledUsername?: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBackToLogin }) => {
  const {
    registerUser,
    login,
    users,
    themeMode,
    toggleTheme,
    language,
    toggleLanguage,
    t,
  } = usePos();
  const isDark = themeMode === 'dark';

  // Stepper State: 1 | 2 | 3
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // STEP 1 FORM STATE: Store & Owner Information
  const [storeName, setStoreName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('cafe');
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [taxId, setTaxId] = useState('');

  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerMobile, setOwnerMobile] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('👑');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // STEP 2 FORM STATE: Subscription & Payment
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'card'>('promptpay');
  const [slipFileName, setSlipFileName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardHolder, setCardHolder] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(899); // 14:59

  // STEP 3 STATE: Generated License & Success
  const [licenseKey, setLicenseKey] = useState('');
  const [activatedPeriod, setActivatedPeriod] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // Form Error
  const [errorMsg, setErrorMsg] = useState('');

  // Countdown timer for Step 2 PromptPay
  useEffect(() => {
    if (step !== 2 || paymentMethod !== 'promptpay') return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, paymentMethod]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Pricing calculations
  const monthlyBase = 590;
  const yearlyBase = 5900;
  const planPrice = plan === 'yearly' ? yearlyBase : monthlyBase;
  const discountAmount = plan === 'yearly' ? 1180 : 0;
  const vatAmount = Math.round(planPrice * 0.07);
  const netTotal = planPrice;

  // STEP 1 VALIDATION & ADVANCE
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!storeName.trim() || !ownerName.trim() || !ownerEmail.trim() || !ownerMobile.trim() || !username.trim() || !password.trim()) {
      setErrorMsg(t.register.fillRequired);
      return;
    }

    if (password.length < 6) {
      setErrorMsg(t.register.passwordPlaceholder);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(t.register.passwordMismatch);
      return;
    }

    const trimmedUser = username.trim().toLowerCase();
    const isTaken = users.some((u) => u.username.toLowerCase() === trimmedUser);
    if (isTaken) {
      setErrorMsg(t.register.usernameExists);
      return;
    }

    setCardHolder(ownerName);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // STEP 2 PAYMENT SUBMIT & SIMULATE VERIFICATION
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsVerifying(true);

    // Simulate verification & license issuance
    setTimeout(() => {
      const now = new Date();
      const expiry = new Date(now.getTime() + (plan === 'yearly' ? 365 : 30) * 86400000);
      setActivatedPeriod(`${now.toLocaleDateString()} — ${expiry.toLocaleDateString()}`);
      const generatedLicense = `LIC-YUMMY-${now.getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setLicenseKey(generatedLicense);
      setIsVerifying(false);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1800);
  };

  // STEP 3 FINAL ACTION: Launch and Auto-Login
  const handleLaunchPos = () => {
    const newUser = registerUser({
      username: username.trim().toLowerCase(),
      name: `${ownerName.trim()} (${storeName.trim()})`,
      role: 'admin',
      avatar,
      gender,
      permissions: ['pos', 'products', 'shifts', 'staff', 'sales', 'reports'],
    });

    login(newUser.username);
  };

  const handleCopyLicense = () => {
    if (!licenseKey) return;
    navigator.clipboard.writeText(licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const AVATAR_OPTIONS = ['👑', '🧑‍🍳', '👩‍🍳', '👨‍💼', '👩‍💼', '🧑‍💻', '☕', '🥐'];

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 transition-colors duration-300 relative overflow-x-hidden ${
        isDark ? 'bg-[#080911] text-slate-100' : 'bg-[#e6e3da] text-slate-800'
      }`}
    >
      {/* Luminous Organic Liquid Blob Ambient Layer */}
      <LiquidBackground />

      {/* Floating Toolbar: Language, Theme & Back to Login */}
      <div className="w-full max-w-5xl flex items-center justify-between z-20 mb-6">
        <button
          onClick={() => onBackToLogin()}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold backdrop-blur-xl border transition cursor-pointer active:scale-95 ${
            isDark
              ? 'bg-[#1a202c]/80 border-white/[0.08] text-slate-300 hover:text-white hover:bg-[#232936]'
              : 'bg-white/80 border-[#ebe7df] text-slate-600 hover:text-slate-900 hover:bg-white shadow-2xs'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.register.backToLoginBtn}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <Tooltip title={t.sidebar.switchLang}>
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-semibold backdrop-blur-xl transition cursor-pointer active:scale-95 ${
                isDark
                  ? 'bg-[#1a202c]/80 border-white/[0.08] text-primary hover:bg-[#232936]'
                  : 'bg-white/80 border-[#ebe7df] text-primary hover:bg-white shadow-2xs'
              }`}
            >
              <Languages className="w-4 h-4 text-primary" />
              <span className={language === 'th' ? 'font-bold underline' : 'opacity-60'}>TH</span>
              <span className="text-slate-400">|</span>
              <span className={language === 'en' ? 'font-bold underline' : 'opacity-60'}>EN</span>
            </button>
          </Tooltip>

          {/* Theme Switcher */}
          <Tooltip title={isDark ? t.sidebar.switchToLight : t.sidebar.switchToDark}>
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-semibold backdrop-blur-xl transition cursor-pointer active:scale-95 ${
                isDark
                  ? 'bg-[#1a202c]/80 border-white/[0.08] text-[#f4a28c] hover:bg-[#232936]'
                  : 'bg-white/80 border-[#ebe7df] text-slate-700 hover:bg-white shadow-2xs'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 text-[#f4a28c]" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-4xl rounded-3xl border liquid-glass-card shadow-2xl p-6 sm:p-8 md:p-10 z-10 space-y-8">
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border liquid-gloss"
            style={{
              backgroundColor: 'var(--theme-primary-light)',
              color: 'var(--theme-primary-text)',
              borderColor: 'var(--theme-primary-border)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store Owner Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.register.pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.register.pageSubtitle}
          </p>
        </div>

        {/* 3-Step Interactive Stepper Indicator */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 relative pt-2">
          {[
            { num: 1, title: t.register.step1, desc: t.register.step1Desc },
            { num: 2, title: t.register.step2, desc: t.register.step2Desc },
            { num: 3, title: t.register.step3, desc: t.register.step3Desc },
          ].map((st) => {
            const isCompleted = step > st.num;
            const isCurrent = step === st.num;

            return (
              <div
                key={st.num}
                className={`p-3 sm:p-4 rounded-2xl border transition-all duration-300 relative flex flex-col sm:flex-row items-center sm:items-start gap-2.5 sm:gap-3 text-center sm:text-left ${
                  isCurrent
                    ? 'border-primary bg-primary-light/40 ring-2 ring-primary/20 shadow-md'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200/80 dark:border-white/5 bg-black/5 dark:bg-white/5 opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 transition-transform ${
                    isCurrent
                      ? 'bg-primary text-white scale-105 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : st.num}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isCurrent ? 'text-primary' : ''}`}>
                    {st.title}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block truncate mt-0.5">
                    {st.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: OWNER & STORE PROFILE FORM */}
        {/* ========================================================================= */}
        {step === 1 && (
          <form onSubmit={handleProceedToStep2} className="space-y-6">
            {/* Section 1: Store & Business Information */}
            <div className="p-5 sm:p-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/10 text-sm font-bold text-slate-800 dark:text-slate-100">
                <Store className="w-4 h-4 text-primary" />
                <span>{t.register.sectionStore}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <PosInput
                    label={t.register.storeName}
                    placeholder={t.register.storeNamePlaceholder}
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <PosSelect
                    label={t.register.businessCategory}
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value as string)}
                  >
                    <MenuItem value="cafe">{t.register.catCafe}</MenuItem>
                    <MenuItem value="restaurant">{t.register.catRestaurant}</MenuItem>
                    <MenuItem value="bakery">{t.register.catBakery}</MenuItem>
                    <MenuItem value="streetfood">{t.register.catStreetFood}</MenuItem>
                    <MenuItem value="retail">{t.register.catRetail}</MenuItem>
                  </PosSelect>
                </div>

                <div>
                  <PosInput
                    label={t.register.storePhone}
                    placeholder={t.register.storePhonePlaceholder}
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                  />
                </div>

                <div>
                  <PosInput
                    label={t.register.storeAddress}
                    placeholder={t.register.storeAddressPlaceholder}
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <PosInput
                    label={t.register.taxId}
                    placeholder={t.register.taxIdPlaceholder}
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Owner & Admin Account */}
            <div className="p-5 sm:p-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/10 text-sm font-bold text-slate-800 dark:text-slate-100">
                <User className="w-4 h-4 text-primary" />
                <span>{t.register.sectionOwner}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <PosInput
                    label={t.register.ownerName}
                    placeholder={t.register.ownerNamePlaceholder}
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <PosInput
                    type="email"
                    label={t.register.ownerEmail}
                    placeholder={t.register.ownerEmailPlaceholder}
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <PosInput
                    type="tel"
                    label={t.register.ownerMobile}
                    placeholder={t.register.ownerMobilePlaceholder}
                    value={ownerMobile}
                    onChange={(e) => setOwnerMobile(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <PosInput
                    label={t.register.username}
                    placeholder={t.register.usernamePlaceholder}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <PosInput
                    type="password"
                    label={t.register.password}
                    placeholder={t.register.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <PosInput
                    type="password"
                    label={t.register.confirmPassword}
                    placeholder={t.register.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Gender Selection & Profile Photo */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  {t.register.genderLabel}
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition cursor-pointer text-left ${
                      gender === 'male'
                        ? 'border-primary ring-2 ring-primary/30 bg-primary-light'
                        : 'border-slate-200 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-black/10 dark:border-white/10 shadow-2xs">
                      <img src={manAvatar} alt="Male" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">
                        {t.register.genderMale}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        man.png
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition cursor-pointer text-left ${
                      gender === 'female'
                        ? 'border-primary ring-2 ring-primary/30 bg-primary-light'
                        : 'border-slate-200 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-black/10 dark:border-white/10 shadow-2xs">
                      <img src={womanAvatar} alt="Female" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">
                        {t.register.genderFemale}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        woman.jpg
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  {t.register.avatar}
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                        avatar === av
                          ? 'border-primary bg-primary-light text-primary-text ring-2 ring-primary scale-110 shadow-sm'
                          : 'border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:scale-105'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => onBackToLogin()}
                className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                {t.common.cancel}
              </button>

              <PosButton
                type="submit"
                variantStyle="primary"
                endIcon={<ArrowRight className="w-4 h-4" />}
                className="px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-lg"
              >
                {t.register.nextToPayment}
              </PosButton>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SUBSCRIPTION PLAN & PAYMENT CONFIRMATION */}
        {/* ========================================================================= */}
        {step === 2 && (
          <form onSubmit={handleConfirmPayment} className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>{t.register.choosePlan}</span>
              </h2>

              {/* Plan Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Monthly Plan */}
                <div
                  onClick={() => setPlan('monthly')}
                  className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer relative flex flex-col justify-between ${
                    plan === 'monthly'
                      ? 'border-primary bg-primary-light/30 ring-2 ring-primary/40 shadow-lg'
                      : 'border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {t.register.monthlyTitle}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        plan === 'monthly' ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-white/20'
                      }`}>
                        {plan === 'monthly' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {t.register.monthlyPrice}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {t.register.monthlyPeriod}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.register.monthlySub}
                    </p>
                  </div>
                </div>

                {/* Yearly Plan (Best Value) */}
                <div
                  onClick={() => setPlan('yearly')}
                  className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer relative flex flex-col justify-between ${
                    plan === 'yearly'
                      ? 'border-primary bg-primary-light/40 ring-2 ring-primary shadow-xl scale-[1.02]'
                      : 'border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:border-slate-300'
                  }`}
                >
                  {/* Popular Badge */}
                  <span
                    className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md uppercase tracking-wider"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    {t.register.popularBadge}
                  </span>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {t.register.yearlyTitle}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        plan === 'yearly' ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-white/20'
                      }`}>
                        {plan === 'yearly' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {t.register.yearlyPrice}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {t.register.yearlyPeriod}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {t.register.yearlySub}
                    </p>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5 text-xs space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.register.featuresIncluded}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{t.register.feat1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{t.register.feat2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{t.register.feat3}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{t.register.feat4}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{t.register.feat5}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{t.register.feat6}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods and Order Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Payment Option (Left 7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>{t.register.paymentMethod}</span>
                </h3>

                {/* Tabs Switcher */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl border border-slate-200 dark:border-white/10 bg-black/5 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'promptpay'
                        ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{t.register.promptpayTab}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{t.register.cardTab}</span>
                  </button>
                </div>

                {/* Payment Option Detail Box */}
                {paymentMethod === 'promptpay' ? (
                  <div className="p-5 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] text-center space-y-4 shadow-sm">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {t.register.promptpayScan}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.register.promptpaySub}
                      </div>
                      <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1 pt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t.register.promptpayTimer}: {formatCountdown(countdown)}</span>
                      </div>
                    </div>

                    {/* QR Code Graphic Box */}
                    <div className="inline-block p-4 rounded-2xl bg-white border border-slate-200 shadow-inner">
                      <div className="w-40 h-40 bg-slate-900 rounded-xl p-2.5 flex flex-col items-center justify-between text-white">
                        <div className="w-full flex justify-between items-center text-[8px] font-bold tracking-widest text-slate-300">
                          <span>THAI QR</span>
                          <span>PROMPTPAY</span>
                        </div>
                        <QrCode className="w-24 h-24 text-white" />
                        <span className="text-[9px] font-mono tracking-widest">฿{netTotal.toLocaleString()}.00</span>
                      </div>
                    </div>

                    {/* Upload Slip Mockup */}
                    <div className="text-left space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t.register.slipUploadTitle}
                      </label>
                      <div
                        onClick={() => setSlipFileName(`slip_${Date.now()}.png`)}
                        className={`p-3 rounded-2xl border-2 border-dashed transition cursor-pointer flex items-center justify-center gap-2 text-xs ${
                          slipFileName
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                            : 'border-slate-300 dark:border-white/15 hover:border-primary text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {slipFileName ? (
                          <>
                            <FileCheck className="w-4 h-4 text-emerald-500" />
                            <span className="font-semibold">{t.register.slipUploaded} {slipFileName}</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4 text-slate-400" />
                            <span>{t.register.slipUploadDesc}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Credit Card Input */
                  <div className="p-5 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] space-y-3.5 shadow-sm">
                    <div>
                      <PosInput
                        label={t.register.cardNum}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <PosInput
                        label={t.register.cardExp}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        required
                      />
                      <PosInput
                        label={t.register.cardCvc}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        required
                      />
                    </div>
                    <div>
                      <PosInput
                        label={t.register.cardHolder}
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Name on card"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary (Right 5 Cols) */}
              <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t.register.orderSummary}
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{t.register.planFee} ({plan === 'yearly' ? t.register.yearlyTitle : t.register.monthlyTitle}):</span>
                    <span>฿{planPrice.toLocaleString()}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>{t.register.discount}:</span>
                      <span>-฿{discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{t.register.vat}:</span>
                    <span>฿{vatAmount.toLocaleString()}</span>
                  </div>

                  <div className="pt-3 border-t border-black/5 dark:border-white/10 flex justify-between items-baseline font-bold text-base text-slate-900 dark:text-white">
                    <span>{t.register.totalPay}:</span>
                    <span className="text-xl" style={{ color: 'var(--theme-primary)' }}>
                      ฿{netTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <PosButton
                    type="submit"
                    variantStyle="primary"
                    disabled={isVerifying}
                    className="w-full py-3.5 rounded-2xl font-bold shadow-lg"
                  >
                    {isVerifying ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t.register.verifyingPayment}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>{t.register.confirmPayBtn}</span>
                      </span>
                    )}
                  </PosButton>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer py-1"
                >
                  {t.register.backBtn}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: APPROVAL & ACTIVATION STATUS */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6 text-center max-w-2xl mx-auto py-2">
            {/* Status Shield Emblem */}
            <div className="relative inline-block">
              <div
                className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl relative overflow-hidden liquid-gloss animate-bounce-short"
                style={{
                  background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-primary-hover))',
                  boxShadow: '0 12px 30px -4px var(--theme-primary)',
                }}
              >
                <BadgeCheck className="w-10 h-10 stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-2">
              <div
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border tracking-wider uppercase"
                style={{
                  backgroundColor: 'var(--theme-primary-light)',
                  color: 'var(--theme-primary-text)',
                  borderColor: 'var(--theme-primary-border)',
                }}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t.register.licenseBadge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t.register.approvedTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t.register.approvedSubtitle}
              </p>
            </div>

            {/* License Key Box */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 flex items-center justify-between gap-3 text-left">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t.register.licenseNo}
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                  {licenseKey}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyLicense}
                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer text-xs flex items-center gap-1"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span className="text-[11px] font-semibold">{copiedKey ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            </div>

            {/* Activated Store Details Grid */}
            <div className="p-5 sm:p-6 rounded-3xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5 text-left text-xs space-y-3">
              <div className="flex justify-between items-center pb-2.5 border-b border-black/5 dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">{t.register.activatedStore}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{storeName}</span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-black/5 dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">{t.register.activatedOwner}:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {avatar} {ownerName} (@{username})
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-black/5 dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">{t.register.activatedPlan}:</span>
                <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>
                  {plan === 'yearly' ? t.register.yearlyTitle : t.register.monthlyTitle}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">{t.register.activatedPeriod}:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {activatedPeriod}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{t.register.readyToUseNotice}</span>
            </div>

            {/* Launch & Return Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => onBackToLogin(username)}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                {t.register.backToLoginBtn}
              </button>

              <PosButton
                type="button"
                variantStyle="primary"
                onClick={handleLaunchPos}
                className="flex-2 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold shadow-xl"
              >
                {t.register.launchPosBtn}
              </PosButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
