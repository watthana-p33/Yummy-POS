import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePos } from '../../context/PosContext';
import {
  Sparkles,
  ArrowRight,
  ShoppingCart,
  Package,
  Clock,
  Users,
  BarChart3,
  ScrollText,
  LogIn,
  Sun,
  Moon,
  Languages,
  Check,
  ChevronRight,
  TrendingUp,
  CreditCard,
  QrCode,
  Banknote,
  ArrowUp,
  ShieldCheck,
  CheckCircle2,
  Monitor,
  Zap,
} from 'lucide-react';
import { Tooltip } from '@mui/material';
import { LiquidBackground } from '../common';
import inkbrushLogo from '../../assets/inkbrush-person-sending-money.svg';
import manAvatar from '../../assets/man.png';
import womanAvatar from '../../assets/woman.jpg';

export const LandingPage: React.FC = () => {
  const { currentUser, themeMode, toggleTheme, language, toggleLanguage, t } = usePos();
  const navigate = useNavigate();
  const [activeRoleTab, setActiveRoleTab] = useState<'admin' | 'manager' | 'cashier'>('admin');

  const isDark = themeMode === 'dark';
  const lt = t.landing;

  const handleSignInClick = () => {
    if (currentUser) {
      navigate('/pos');
    } else {
      navigate('/login');
    }
  };

  const getUserAvatarSrc = (user?: { gender?: 'male' | 'female'; avatar?: string } | null) => {
    if (user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'))) {
      return user.avatar;
    }
    return user?.gender === 'female' ? womanAvatar : manAvatar;
  };

  const featureCards = [
    {
      id: 'pos',
      icon: <ShoppingCart className="w-6 h-6 text-emerald-500" />,
      title: lt.feat1Title,
      desc: lt.feat1Desc,
      tag: '0.4s Checkout',
      gradient: 'from-emerald-500/10 to-teal-500/5',
      borderColor: 'hover:border-emerald-500/40',
    },
    {
      id: 'inventory',
      icon: <Package className="w-6 h-6 text-sky-500" />,
      title: lt.feat2Title,
      desc: lt.feat2Desc,
      tag: 'Real-time Stock',
      gradient: 'from-sky-500/10 to-blue-500/5',
      borderColor: 'hover:border-sky-500/40',
    },
    {
      id: 'shift',
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      title: lt.feat3Title,
      desc: lt.feat3Desc,
      tag: 'Cash Protection',
      gradient: 'from-amber-500/10 to-orange-500/5',
      borderColor: 'hover:border-amber-500/40',
    },
    {
      id: 'staff',
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: lt.feat4Title,
      desc: lt.feat4Desc,
      tag: '6 Roles & Gender Avatars',
      gradient: 'from-purple-500/10 to-indigo-500/5',
      borderColor: 'hover:border-purple-500/40',
    },
    {
      id: 'analytics',
      icon: <BarChart3 className="w-6 h-6 text-rose-500" />,
      title: lt.feat5Title,
      desc: lt.feat5Desc,
      tag: 'MUI Charts',
      gradient: 'from-rose-500/10 to-pink-500/5',
      borderColor: 'hover:border-rose-500/40',
    },
    {
      id: 'reports',
      icon: <ScrollText className="w-6 h-6 text-cyan-500" />,
      title: lt.feat6Title,
      desc: lt.feat6Desc,
      tag: 'Instant .XLSX',
      gradient: 'from-cyan-500/10 to-blue-500/5',
      borderColor: 'hover:border-cyan-500/40',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: lt.step1Title,
      desc: lt.step1Desc,
      icon: <Clock className="w-5 h-5 text-amber-500" />,
    },
    {
      step: '02',
      title: lt.step2Title,
      desc: lt.step2Desc,
      icon: <ShoppingCart className="w-5 h-5 text-emerald-500" />,
    },
    {
      step: '03',
      title: lt.step3Title,
      desc: lt.step3Desc,
      icon: <Package className="w-5 h-5 text-blue-500" />,
    },
    {
      step: '04',
      title: lt.step4Title,
      desc: lt.step4Desc,
      icon: <ScrollText className="w-5 h-5 text-purple-500" />,
    },
  ];

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 relative overflow-x-hidden ${
        isDark ? 'bg-[#080911] text-slate-100' : 'bg-[#f7f5f0] text-slate-800'
      }`}
    >
      {/* Luminous Organic Liquid Ambient Layer */}
      <LiquidBackground />

      {/* FIXED TOP NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-200 ${
          isDark
            ? 'bg-[#0c0e17]/85 border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
            : 'bg-white/85 border-[#ebe7df] shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0 transition-transform duration-300 hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-primary)',
                boxShadow: '0 4px 14px var(--theme-primary-border)',
              }}
            >
              <img
                src={inkbrushLogo}
                alt="Yummy POS Logo"
                className="w-5 h-5 sm:w-7 sm:h-7 object-contain brightness-0 invert"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  {t.common.appName}
                </span>
                <span
                  className="hidden sm:inline-flex text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider whitespace-nowrap"
                  style={{
                    backgroundColor: 'var(--theme-primary-light)',
                    color: 'var(--theme-primary-text)',
                  }}
                >
                  {t.common.version}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block whitespace-nowrap">
                {t.common.appSubtitle}
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
            <a
              href="#features"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              {lt.navFeatures}
            </a>
            <a
              href="#workflow"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              {lt.navWorkflow}
            </a>
            <a
              href="#roles"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              {lt.navRoles}
            </a>
            <a
              href="#preview"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              {lt.navStats}
            </a>
          </nav>

          {/* Right Action Tools: Language, Theme & Sign In Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Language Switcher */}
            <Tooltip title={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}>
              <button
                type="button"
                onClick={toggleLanguage}
                className={`h-9 px-2 sm:px-2.5 rounded-xl sm:rounded-2xl border flex items-center gap-1 sm:gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 shadow-xs text-xs font-semibold select-none flex-shrink-0 ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/18 border-white/15 text-slate-200'
                    : 'bg-white/80 hover:bg-white border-black/5 text-slate-700 hover:text-slate-900'
                }`}
                aria-label="Toggle language"
              >
                <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: 'var(--theme-primary)' }} />
                <span className="sm:hidden text-[11px] font-bold uppercase tracking-wide">{language}</span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  <span className={language === 'th' ? 'font-bold underline' : 'opacity-60'}>TH</span>
                  <span className="text-slate-300 dark:text-slate-600 font-light">|</span>
                  <span className={language === 'en' ? 'font-bold underline' : 'opacity-60'}>EN</span>
                </span>
              </button>
            </Tooltip>

            {/* Theme Switcher */}
            <Tooltip title={isDark ? t.sidebar.switchToLight : t.sidebar.switchToDark}>
              <button
                type="button"
                onClick={toggleTheme}
                className={`w-9 h-9 rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-xs flex-shrink-0 ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/18 border-white/15 text-amber-300'
                    : 'bg-white/80 hover:bg-white border-black/5 text-slate-700 hover:text-slate-900'
                }`}
                aria-label="Toggle light/dark theme"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 transition-transform duration-200 hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 transition-transform duration-200 hover:-rotate-12" />
                )}
              </button>
            </Tooltip>

            {/* Sign In / Launch POS Button */}
            <Tooltip title={currentUser ? lt.launchPosBtn : lt.signInBtn}>
              <button
                type="button"
                data-testid="landing-signin-btn"
                onClick={handleSignInClick}
                className="w-9 h-9 sm:w-auto sm:h-10 px-0 sm:px-4 rounded-xl sm:rounded-2xl text-white font-semibold text-xs sm:text-sm flex items-center justify-center sm:gap-2 cursor-pointer shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-95 flex-shrink-0 whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  boxShadow: '0 4px 14px var(--theme-primary-border)',
                }}
                aria-label={currentUser ? lt.launchPosBtn : lt.signInBtn}
              >
                {currentUser ? (
                  <>
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-white/60 bg-white/40">
                      <img
                        src={getUserAvatarSrc(currentUser)}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="hidden sm:inline whitespace-nowrap">
                      {lt.launchPosBtn}
                    </span>
                    <ArrowRight className="w-4 h-4 hidden sm:block flex-shrink-0" />
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">
                      {lt.signInBtn}
                    </span>
                  </>
                )}
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Fixed Navbar Spacer */}
      <div className="h-16 sm:h-18" aria-hidden="true" />

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Glowing Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold mb-6 shadow-sm animate-pulse backdrop-blur-md"
              style={{
                backgroundColor: 'var(--theme-primary-light)',
                borderColor: 'var(--theme-primary-border)',
                color: 'var(--theme-primary-text)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{lt.heroBadge}</span>
            </div>

            {/* Big Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight mb-6 text-slate-900 dark:text-white">
              {lt.heroTitlePrefix}{' '}
              <span
                className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--theme-primary)] via-emerald-500 to-teal-400"
              >
                {lt.heroTitleHighlight}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
              {lt.heroSubtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
              <button
                type="button"
                data-testid="hero-primary-cta"
                onClick={handleSignInClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  boxShadow: '0 8px 24px var(--theme-primary-border)',
                }}
              >
                <span>{currentUser ? lt.launchPosBtn : lt.ctaStart}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="#features"
                className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl border font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer backdrop-blur-md ${
                  isDark
                    ? 'border-white/15 bg-white/5 hover:bg-white/10 text-white'
                    : 'border-slate-300/80 bg-white/80 hover:bg-white text-slate-700 shadow-sm'
                }`}
              >
                <span>{lt.ctaExplore}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </a>
            </div>

            {/* Key Metrics Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-black/5 dark:border-white/10">
              <div className="p-3 rounded-2xl liquid-glass-panel text-center">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white" style={{ color: 'var(--theme-primary)' }}>
                  {lt.stat1Number}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {lt.stat1Label}
                </div>
              </div>
              <div className="p-3 rounded-2xl liquid-glass-panel text-center">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white" style={{ color: 'var(--theme-primary)' }}>
                  {lt.stat2Number}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {lt.stat2Label}
                </div>
              </div>
              <div className="p-3 rounded-2xl liquid-glass-panel text-center">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white" style={{ color: 'var(--theme-primary)' }}>
                  {lt.stat3Number}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {lt.stat3Label}
                </div>
              </div>
              <div className="p-3 rounded-2xl liquid-glass-panel text-center">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white" style={{ color: 'var(--theme-primary)' }}>
                  {lt.stat4Number}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {lt.stat4Label}
                </div>
              </div>
            </div>
          </div>

          {/* INTERACTIVE LIVE SYSTEM PREVIEW MOCKUP */}
          <div id="preview" className="mt-14 sm:mt-18 max-w-5xl mx-auto">
            <div className="relative rounded-3xl p-3 sm:p-5 liquid-glass-card shadow-2xl border border-white/40 dark:border-white/10">
              {/* Header simulation */}
              <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2">
                    {lt.liveDemoTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {lt.liveShiftStatus}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    {lt.liveShiftCashier}
                  </span>
                </div>
              </div>

              {/* Body grid simulation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
                {/* Left: Quick Cart & Checkout preview */}
                <div className="lg:col-span-5 p-4 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t.pos.cartTitle} (3 {t.common.items})
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {t.customers.walkInCustomer}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          อเมริกาโน่เย็น (Iced Americano)
                        </div>
                        <div className="text-[10px] text-slate-400">1 x ฿65.00</div>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">฿65.00</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          ครัวซองต์เนยสดฝรั่งเศส
                        </div>
                        <div className="text-[10px] text-slate-400">1 x ฿65.00</div>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">฿65.00</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          สปาเก็ตตี้คาโบนาร่าเบคอนกรอบ
                        </div>
                        <div className="text-[10px] text-slate-400">1 x ฿135.00</div>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">฿135.00</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/5 dark:border-white/10 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>{t.pos.subtotal}</span>
                      <span>฿265.00</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>{t.pos.tax}</span>
                      <span>฿18.55</span>
                    </div>
                    <div className="flex justify-between font-bold text-base text-slate-900 dark:text-white pt-1">
                      <span>{t.pos.total}</span>
                      <span style={{ color: 'var(--theme-primary)' }}>฿283.55</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignInClick}
                    className="w-full mt-3 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-95 transition"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    <span>{t.pos.checkoutBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right: Real-time Analytics & Shift Overview Preview */}
                <div className="lg:col-span-7 flex flex-col justify-between gap-3">
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      <div className="text-[10px] font-semibold text-slate-400">
                        {lt.liveSalesToday}
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                        ฿14,250.00
                      </div>
                      <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-0.5">
                        <TrendingUp className="w-3 h-3" />
                        +18.4%
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      <div className="text-[10px] font-semibold text-slate-400">
                        {t.staff.totalOrdersCount}
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                        68 {language === 'th' ? 'บิล' : 'Orders'}
                      </div>
                      <div className="text-[10px] text-sky-500 font-bold flex items-center gap-1 mt-0.5">
                        เฉลี่ย ฿209/บิล
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/5 col-span-2 sm:col-span-1">
                      <div className="text-[10px] font-semibold text-slate-400">
                        {t.staff.actualCash}
                      </div>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ฿8,450.00
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {t.staff.startingCash} ฿2,000
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods Strip */}
                  <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                      {t.pos.choosePaymentMethod}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-center gap-1.5">
                        <QrCode className="w-4 h-4" />
                        <span>PromptPay</span>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold flex items-center justify-center gap-1.5">
                        <Banknote className="w-4 h-4" />
                        <span>{t.pos.paymentMethods.cash}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold flex items-center justify-center gap-1.5">
                        <CreditCard className="w-4 h-4" />
                        <span>{t.pos.paymentMethods.credit_card}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shift & Staff banner */}
                  <div className="p-3.5 rounded-2xl border border-black/5 dark:border-white/5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500/40 shadow-xs flex-shrink-0">
                        <img src={manAvatar} alt="Somchai" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          สมชาย ตั้งใจขาย (Cashier)
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {t.staff.currentShiftTitle}: 08:00 - 16:00
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-xs">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 CORE PILLAR FEATURES SECTION */}
      <section id="features" className="py-20 border-t border-black/5 dark:border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
              {lt.featuresTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              {lt.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((card) => (
              <div
                key={card.id}
                className={`p-6 rounded-3xl liquid-glass-panel border border-black/5 dark:border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${card.borderColor} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${card.gradient} border border-black/5 dark:border-white/10 shadow-xs`}>
                      {card.icon}
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center text-xs font-semibold text-primary">
                  <span>{t.common.view}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 WORKFLOW STEPS SECTION */}
      <section id="workflow" className="py-20 border-t border-black/5 dark:border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
              {lt.workflowTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              {lt.workflowSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl liquid-glass-panel border border-black/5 dark:border-white/10 relative"
              >
                <span className="text-3xl font-black text-slate-300 dark:text-slate-700/60 block mb-2 font-mono">
                  {step.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3">
                  {step.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLE PERMISSION SHOWCASE */}
      <section id="roles" className="py-20 border-t border-black/5 dark:border-white/10 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
              {lt.navRoles}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              {t.staff.subtitle}
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1.5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveRoleTab('admin')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeRoleTab === 'admin'
                    ? 'bg-white dark:bg-[#1a202c] text-primary shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                🧑‍💻 {t.sidebar.admin} (Owner)
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleTab('manager')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeRoleTab === 'manager'
                    ? 'bg-white dark:bg-[#1a202c] text-primary shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                👩‍💼 {t.sidebar.manager}
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleTab('cashier')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeRoleTab === 'cashier'
                    ? 'bg-white dark:bg-[#1a202c] text-primary shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                👨‍🍳 {t.sidebar.cashier}
              </button>
            </div>
          </div>

          {/* Role Details Card */}
          <div className="p-6 sm:p-8 rounded-3xl liquid-glass-panel border border-black/5 dark:border-white/10 shadow-lg">
            {activeRoleTab === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <div className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-3">
                    Full Access Rights
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    Admin / เจ้าของร้าน (Owner)
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {t.staff.ownerNotice} เข้าถึงทุกเมนูในระบบ มีสิทธิ์เพิ่ม แก้ไข ลบพนักงาน กำหนดสิทธิ์รายบุคคล และดูรายงานสรุปยอดขายผลกำไรทั้งหมด
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>จัดการพนักงานและสิทธิ์การเข้าถึง (Staff Management)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>รายงานสรุปรายได้และส่งออก Excel (Reports Export)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>ตั้งค่าระบบ ธีม ฟอนต์ และการชำระเงิน</span>
                    </li>
                  </ul>
                </div>
                <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary shadow-md">
                    <img src={manAvatar} alt="Admin" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Admin ผู้จัดการร้าน (Owner)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">@admin • Male</div>
                  <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 uppercase">
                    Admin Full Control
                  </span>
                </div>
              </div>
            )}

            {activeRoleTab === 'manager' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <div className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3">
                    Management Operations
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    Store Manager / ผู้จัดการร้าน
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    ดูแลการทำงานประจำวัน คลังสินค้า ตรวจสอบกะการขาย จัดการราคาสินค้า และดูภาพรวมยอดขายหน้าร้าน
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>เพิ่ม/แก้ไขสินค้าและหมวดหมู่ (Products & Inventory)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>ตรวจสอบกะการขายและเงินสด (Shifts Reconciliation)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>ดูประวัติการขายและใบเสร็จ (Sales History)</span>
                    </li>
                  </ul>
                </div>
                <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary shadow-md">
                    <img src={womanAvatar} alt="Suda" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">สุดา ยิ้มแย้ม (Manager)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">@suda • Female</div>
                  <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 uppercase">
                    Store Operations
                  </span>
                </div>
              </div>
            )}

            {activeRoleTab === 'cashier' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <div className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                    Frontline Sales Focus
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    Cashier / พนักงานขายหน้าร้าน
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    ใช้งานหน้าขาย POS เป็นหลัก คิดเงิน รวดเร็ว บันทึกเงินสดเปิด-ปิดกะประจำวัน พร้อมพิมพ์ใบเสร็จ
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>จุดขายสินค้า & คำนวณเงินด่วน (POS Checkout)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>เปิดและปิดกะเงินสดของตนเอง (Cashier Shift)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>ค้นหาและสแกนบาร์โค้ดสินค้าได้รวดเร็ว</span>
                    </li>
                  </ul>
                </div>
                <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary shadow-md">
                    <img src={manAvatar} alt="Somchai" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">สมชาย ตั้งใจขาย (Cashier)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">@somchai • Male</div>
                  <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                    POS Sales Terminal
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-20 border-t border-black/5 dark:border-white/10 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="p-8 sm:p-12 rounded-3xl text-center text-white relative overflow-hidden shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--theme-primary) 0%, #1e3a2f 100%)',
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
                {lt.readyTitle}
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-8">
                {lt.readySubtitle}
              </p>

              <button
                type="button"
                data-testid="landing-bottom-cta"
                onClick={handleSignInClick}
                className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-extrabold text-sm sm:text-base shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2.5"
              >
                <span>{currentUser ? lt.launchPosBtn : lt.getStartedBtn}</span>
                <ArrowRight className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#0c0e17]/90 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10">
            {/* Col 1-2: Brand & Identity */}
            <div className="sm:col-span-2 lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0 transition-transform duration-300 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--theme-primary)',
                    boxShadow: '0 4px 14px var(--theme-primary-border)',
                  }}
                >
                  <img
                    src={inkbrushLogo}
                    alt="Yummy POS Logo"
                    className="w-6 h-6 object-contain brightness-0 invert"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                      {t.common.appName}
                    </span>
                    <span
                      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider"
                      style={{
                        backgroundColor: 'var(--theme-primary-light)',
                        color: 'var(--theme-primary-text)',
                      }}
                    >
                      {t.common.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t.common.appSubtitle}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
                {lt.footerDesc}
              </p>

              {/* Status & Highlights */}
              <div className="pt-1 space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>{lt.footerStatusOperational}</span>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    ⚡ {lt.footerQuickCheckout}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    🛡️ {lt.footerRoleControl}
                  </span>
                </div>
              </div>
            </div>

            {/* Col 3: Navigation Links */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {lt.footerNavTitle}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary transition-colors duration-150 inline-flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span>{lt.navFeatures}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#workflow"
                    className="hover:text-primary transition-colors duration-150 inline-flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span>{lt.navWorkflow}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#roles"
                    className="hover:text-primary transition-colors duration-150 inline-flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span>{lt.navRoles}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#preview"
                    className="hover:text-primary transition-colors duration-150 inline-flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span>{lt.liveDemoTitle}</span>
                  </a>
                </li>
                <li className="pt-1">
                  <button
                    type="button"
                    onClick={handleSignInClick}
                    className="hover:underline transition-all duration-150 inline-flex items-center gap-1.5 font-bold cursor-pointer text-left"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{currentUser ? lt.launchPosBtn : lt.signInBtn}</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: System Modules */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {lt.footerModulesTitle}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <ShoppingCart className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>{lt.feat1Title}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span>{lt.feat2Title}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>{lt.feat3Title}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                  <span>{lt.feat4Title}</span>
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                  <span>{lt.feat5Title}</span>
                </li>
              </ul>
            </div>

            {/* Col 5: Security & Compliance */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {lt.footerSecurityTitle}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>PromptPay QR (EMVCo)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>{lt.footerVatBadge}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>{lt.footerOfflineBadge}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>{lt.footerAnalytics}</span>
                </li>
              </ul>
            </div>

            {/* Col 6: Support & Devices */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {lt.footerSupportTitle}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span>{lt.footerDeviceSupport}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Languages className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span>{lt.footerDualLang}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>Barcode & Cash Drawer</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright, Tech Tag, and Back-to-Top */}
          <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="text-center sm:text-left">
              © 2026 <span className="font-bold text-slate-700 dark:text-slate-200">{t.common.appName}</span>. {lt.allRightsReserved}
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden md:inline-block text-[11px] text-slate-400 dark:text-slate-500">
                {lt.footerBuiltWith}
              </span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition font-medium cursor-pointer"
              >
                <span>{lt.footerBackToTop}</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
