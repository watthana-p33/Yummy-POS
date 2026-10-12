import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import {
  ShieldCheck,
  UserCheck,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  Coffee,
  Languages,
} from 'lucide-react';
import { Alert, Tooltip, Box } from '@mui/material';
import { PosButton, PosInput, LiquidBackground } from './common';
import { RegisterScreen } from './RegisterScreen';
import inkbrushLogo from '../assets/inkbrush-person-sending-money.svg';
import manAvatar from '../assets/man.png';
import womanAvatar from '../assets/woman.jpg';

export const LoginScreen: React.FC = () => {
  const { login, users, themeMode, toggleTheme, language, toggleLanguage, t } = usePos();
  const [username, setUsername] = useState('somchai');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError(t.login.errorEmpty);
      return;
    }
    const success = login(username);
    if (!success) {
      setError(t.login.errorNotFound);
    }
  };

  const handleSelectQuickUser = (uName: string) => {
    setUsername(uName);
    setPassword('123456');
    setError('');
  };

  const isDark = themeMode === 'dark';

  if (isRegistering) {
    return (
      <RegisterScreen
        onBackToLogin={(prefilled) => {
          setIsRegistering(false);
          if (prefilled) {
            setUsername(prefilled);
          }
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden ${
        isDark
          ? 'bg-[#080911] text-slate-100'
          : 'bg-[#e6e3da] text-slate-800'
      }`}
    >
      {/* Luminous Organic Liquid Blob Ambient Layer */}
      <LiquidBackground />

      {/* Floating Utility Controls (Language & Theme Switcher) at Top Right */}
      <div className="absolute top-5 right-5 sm:top-8 sm:right-8 z-20 flex items-center gap-2.5">
        {/* Language Switcher */}
        <Tooltip title={t.sidebar.switchLang}>
          <button
            data-testid="toggle-lang-btn"
            onClick={toggleLanguage}
            className={`min-h-[44px] min-w-[70px] flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-semibold transition-all duration-200 cursor-pointer backdrop-blur-xl active:scale-95 ${
              isDark
                ? 'bg-[#1a202c]/80 border-white/[0.1] text-primary hover:bg-[#232936] shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)]'
                : 'bg-white/85 border-[#ebe7df]/90 text-primary hover:bg-[#f5f4ef] shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)]'
            }`}
          >
            <Languages className="w-4 h-4 text-primary" />
            <span className={language === 'th' ? 'font-bold underline' : 'opacity-60'}>TH</span>
            <span className="text-slate-300 dark:text-slate-600 font-light">|</span>
            <span className={language === 'en' ? 'font-bold underline' : 'opacity-60'}>EN</span>
          </button>
        </Tooltip>

        {/* Theme Switcher */}
        <Tooltip title={isDark ? t.sidebar.switchToLight : t.sidebar.switchToDark}>
          <button
            onClick={toggleTheme}
            className={`min-h-[44px] min-w-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold transition-all duration-200 cursor-pointer backdrop-blur-xl active:scale-95 ${
              isDark
                ? 'bg-[#1a202c]/80 border-white/[0.1] text-[#f4a28c] hover:bg-[#232936] shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)]'
                : 'bg-white/85 border-[#ebe7df]/90 text-slate-700 hover:bg-[#f5f4ef] shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)]'
            }`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-[#f4a28c]" />
                <span>{t.sidebar.themeLight}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span>{t.sidebar.themeDark}</span>
              </>
            )}
          </button>
        </Tooltip>
      </div>

      {/* Main Login Card - Liquid Luxury Minimal Layout */}
      <div
        className={`w-full max-w-4xl rounded-3xl border overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all duration-300 z-10 backdrop-blur-2xl ${
          isDark
            ? 'bg-[#151922]/90 border-white/[0.08] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)]'
            : 'bg-white/92 border-[#ebe7df]/80 shadow-[0_24px_64px_-12px_rgba(45,55,72,0.12),inset_0_1px_1px_rgba(255,255,255,0.95)]'
        }`}
      >
        {/* Left Brand Panel (40% on Desktop) */}
        <div
          className="md:col-span-5 p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden bg-gradient-to-br from-primary to-[var(--theme-primary-hover)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]"
        >
          {/* Subtle Graphic Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>{t.login.badge}</span>
            </div>

            <div className="mt-8">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white shadow-inner mb-4">
                <img
                  src={inkbrushLogo}
                  alt="Logo"
                  className="w-10 h-10 object-contain brightness-0 invert"
                />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {t.login.welcomeHeader}
              </h1>
              <p className="text-white/80 text-sm mt-2 leading-relaxed">
                {t.login.welcomeDesc}
              </p>
            </div>
          </div>

          {/* Bottom Shift Helper Banner */}
          <div className="relative z-10 mt-10 pt-6 border-t border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Coffee className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{t.login.shiftStatus}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form & Quick Cashier Panel (60% on Desktop) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div className="bg-transparent">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {t.login.title}
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.login.subtitle}
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <PosInput
                  label={t.login.usernameLabel}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder={t.login.usernamePlaceholder}
                />
              </div>

              <div>
                <PosInput
                  type="password"
                  label={t.login.passwordLabel}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.login.passwordPlaceholder}
                />
              </div>

              {error && (
                <Alert
                  severity="error"
                  icon={<ShieldCheck className="w-4 h-4 text-red-500" />}
                  sx={{
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                    color: isDark ? '#fca5a5' : '#b91c1c',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#fecaca',
                  }}
                >
                  {error}
                </Alert>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <PosButton
                  type="submit"
                  variantStyle="primary"
                  fullWidth
                  endIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {t.login.submitBtn}
                </PosButton>

                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-[#5b8a72] text-[#387258] dark:text-[#7eb99d] hover:bg-[#e8f3ee] dark:hover:bg-[#273931] text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.login.registerLink}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Cashier Picker for Smooth Evaluation */}
          <Box className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <UserCheck className="w-4 h-4 text-[#5b8a72]" />
                {t.login.quickSelectTitle}
              </span>
              <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {t.login.quickSelectSub}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {users.map((u) => {
                const isSelected = username === u.username;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectQuickUser(u.username)}
                    className={`p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#5b8a72] bg-[#e8f3ee] text-[#2c5341] dark:bg-[#273931] dark:text-[#7eb99d] dark:border-[#5b8a72]'
                        : isDark
                        ? 'border-[rgba(255,255,255,0.08)] bg-[#232936]/60 hover:bg-[#232936] text-slate-300'
                        : 'border-[#ebe7df] bg-[#fbfbf9] hover:bg-[#f5f4ef] text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-black/10 dark:border-white/10 shadow-2xs">
                        <img
                          src={u.gender === 'female' ? womanAvatar : manAvatar}
                          alt={u.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">{u.name}</div>
                        <div className={`text-[10px] uppercase font-mono truncate ${
                          isSelected ? 'text-[#387258] dark:text-[#7eb99d]' : isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {u.role === 'admin'
                            ? t.sidebar.admin
                            : u.role === 'manager'
                            ? t.sidebar.manager
                            : t.sidebar.cashier}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Box>
        </div>
      </div>

    </div>
  );
};
