import React, { useState, useMemo, useEffect } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { createAppTheme } from "./theme/theme";
import { PosProvider, usePos, hasMenuPermission } from "./context/PosContext";
import { LogOut, Settings, Sun, Moon, Languages, Sparkles, Menu as MenuIcon, X } from "lucide-react";
import { LandingPage, LoginScreen } from "./components/screens";
import { Sidebar } from "./components/layout";
import {
  FEATURE_REGISTRY,
  ALL_FEATURE_IDS,
  DEFAULT_FEATURE_ID,
  type FeatureId,
} from "./config/features";
import { SettingsModal, LiquidBackground } from "./components/common";
import inkbrushLogo from "./assets/inkbrush-person-sending-money.svg";
import manAvatar from "./assets/man.png";
import womanAvatar from "./assets/woman.jpg";

const getUserAvatar = (user?: { gender?: "male" | "female"; avatar?: string } | null) => {
  if (user?.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("data:"))) {
    return user.avatar;
  }
  return user?.gender === "female" ? womanAvatar : manAvatar;
};

/**
 * Main Layout for authenticated POS pages (Header + Sidebar + Screen view)
 */
const MainLayout: React.FC = () => {
  const {
    currentUser,
    logout,
    themeMode,
    toggleTheme,
    t,
    language,
    toggleLanguage,
  } = usePos();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null);
  };

  // Derive currentTab from URL path using centralized feature registry
  const currentTab = (location.pathname.replace(/^\//, "") || DEFAULT_FEATURE_ID) as FeatureId;

  // Guard: Automatically redirect to first allowed tab if currentTab is restricted
  useEffect(() => {
    if (currentUser && !hasMenuPermission(currentUser, currentTab)) {
      const firstAllowed =
        ALL_FEATURE_IDS.find((tab) => hasMenuPermission(currentUser, tab)) || DEFAULT_FEATURE_ID;
      navigate(`/${firstAllowed}`, { replace: true });
    }
  }, [currentUser, currentTab, navigate]);

  return (
    <div
      className={`min-h-screen h-screen flex flex-col gap-2 p-2 font-sans transition-colors duration-200 overflow-hidden relative ${
        themeMode === "dark"
          ? "bg-[#080911] text-slate-100"
          : "bg-[#e6e3da] text-slate-800"
      }`}
    >
      {/* Luminous Organic Liquid Blob Ambient Layer */}
      <LiquidBackground />

      {/* Brand Header */}
      <header className="h-[60px] px-2 sm:px-3 liquid-glass-panel flex items-center justify-between gap-2 sm:gap-4 flex-shrink-0 z-30">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, minWidth: 0 }}>
          {/* Mobile Menu Hamburger Button (MUI Responsive) */}
          <IconButton
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open navigation menu"
            sx={{
              display: { xs: 'flex', md: 'none' },
              p: 1,
              color: 'text.primary',
              borderRadius: '14px',
              border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
              bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
            }}
          >
            <MenuIcon className="w-5 h-5" />
          </IconButton>

          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer group"
            title={language === "th" ? "กลับหน้าแนะนำระบบ (Landing Page)" : "Back to System Overview"}
          >
            {/* Brand Logo */}
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundColor: "var(--theme-primary)",
                boxShadow:
                  "0 4px 14px var(--theme-primary-border), inset 0 1px 1px rgba(255, 255, 255, 0.45)",
              }}
            >
              <img
                src={inkbrushLogo}
                alt="Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain brightness-0 invert"
              />
            </div>

            {/* Animated Brand Title & Subtitle */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base tracking-tight text-[#2d3748] dark:text-[#f7fafc] truncate">
                  {t.common.appName}
                </span>
                <Box
                  component="span"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                  className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full tracking-wider flex-shrink-0 transition-colors duration-300"
                  style={{
                    backgroundColor: "var(--theme-primary-light)",
                    color: "var(--theme-primary-text)",
                  }}
                >
                  {t.common.version}
                </Box>
              </div>
              <Box
                component="p"
                sx={{ display: { xs: 'none', md: 'block' } }}
                className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium"
              >
                {t.common.appSubtitle}
              </Box>
            </div>
          </div>
        </Box>

        {/* Right actions: Theme Toggle + Language Switcher + Cashier Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Cashier Avatar & Name with MUI Dropdown Menu */}
            <button
              type="button"
              data-testid="header-avatar-btn"
              aria-controls={isProfileMenuOpen ? "user-account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen ? "true" : undefined}
              onClick={handleOpenProfileMenu}
              className="flex items-center rounded-full border-0 border-transparent outline-none focus:outline-none focus:ring-0 hover:ring-0 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 bg-transparent p-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/60 dark:border-white/20 flex-shrink-0 shadow-2xs bg-white">
                <img
                  src={getUserAvatar(currentUser)}
                  alt={currentUser?.name || "User Avatar"}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
            <Box
              component="span"
              sx={{ display: { xs: 'none', sm: 'inline' } }}
              className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 max-w-[140px] md:max-w-[200px] truncate select-none"
            >
              {currentUser?.name || t.sidebar.cashier}
            </Box>
          </div>

          <Box
            component="span"
            sx={{ display: { xs: 'none', sm: 'inline' } }}
            className="text-xl font-medium text-slate-400 dark:text-slate-600"
          >
            |
          </Box>

          {/* Header Theme Toggle Button (Light / Dark) */}
          <Tooltip
            title={themeMode === "dark" ? t.sidebar.switchToLight : t.sidebar.switchToDark}
            placement="bottom"
          >
            <button
              type="button"
              data-testid="header-theme-toggle-btn"
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-xs ${
                themeMode === "dark"
                  ? "bg-white/10 hover:bg-white/18 border-white/15 text-amber-300"
                  : "bg-white/80 hover:bg-white border-black/5 text-slate-700 hover:text-slate-900"
              }`}
              aria-label="Toggle light/dark theme"
            >
              {themeMode === "dark" ? (
                <Sun className="w-4 h-4 transition-transform duration-200 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 transition-transform duration-200 hover:-rotate-12" />
              )}
            </button>
          </Tooltip>

          {/* Header Language Switcher Button (TH / EN) */}
          <Tooltip
            title={language === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
            placement="bottom"
          >
            <button
              type="button"
              data-testid="header-lang-toggle-btn"
              onClick={toggleLanguage}
              className={`h-9 px-2.5 rounded-2xl border flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 shadow-xs text-xs font-semibold select-none ${
                themeMode === "dark"
                  ? "bg-white/10 hover:bg-white/18 border-white/15 text-slate-200"
                  : "bg-white/80 hover:bg-white border-black/5 text-slate-700 hover:text-slate-900"
              }`}
              aria-label="Toggle language"
            >
              <Languages
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "var(--theme-primary)" }}
              />
              <span
                className={
                  language === "th"
                    ? "font-bold underline text-primary-text"
                    : "opacity-60 font-normal"
                }
              >
                TH
              </span>
              <span className="text-slate-300 dark:text-slate-600 font-light">|</span>
              <span
                className={
                  language === "en"
                    ? "font-bold underline text-primary-text"
                    : "opacity-60 font-normal"
                }
              >
                EN
              </span>
            </button>
          </Tooltip>

          {/* MUI Profile Dropdown Menu */}
          <Menu
            id="user-account-menu"
            anchorEl={profileAnchorEl}
            open={isProfileMenuOpen}
            onClose={handleCloseProfileMenu}
            transformOrigin={{ horizontal: "left", vertical: "top" }}
            anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  mt: 1.5,
                  minWidth: 260,
                  borderRadius: "20px",
                  overflow: "hidden",
                  p: 1.5,
                  backgroundColor: themeMode === "dark" ? "#1a202c" : "#ffffff",
                  border:
                    themeMode === "dark"
                      ? "1px solid rgba(255, 255, 255, 0.08)"
                      : "1px solid #ebe7df",
                  boxShadow:
                    themeMode === "dark"
                      ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)"
                      : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  backgroundImage: "none",
                  "& .MuiList-root": {
                    p: 0,
                  },
                },
              },
            }}
          >
            {/* User Profile Card Header */}
            <div className="flex items-center gap-3 p-1 select-none">
              <div className="w-11 h-11 rounded-2xl border border-primary-border overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs bg-white/40 dark:bg-white/10">
                <img
                  src={getUserAvatar(currentUser)}
                  alt={currentUser?.name || "User Avatar"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {currentUser?.name || t.sidebar.cashier}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-light text-primary-text tracking-wide uppercase">
                    {currentUser?.role === "admin"
                      ? t.sidebar.admin
                      : currentUser?.role === "manager"
                      ? t.sidebar.manager
                      : t.sidebar.cashier}
                  </span>
                  {currentUser?.username && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">
                      @{currentUser.username}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Divider
              sx={{
                my: 1.5,
                borderColor:
                  themeMode === "dark" ? "rgba(255, 255, 255, 0.08)" : "#ebe7df",
              }}
            />

            {/* Back to System Overview (Landing Page) MenuItem */}
            <MenuItem
              onClick={() => {
                handleCloseProfileMenu();
                navigate("/");
              }}
              sx={{
                borderRadius: "12px",
                px: 1.5,
                py: 1,
                gap: 1.5,
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: themeMode === "dark" ? "#e2e8f0" : "#334155",
                transition: "all 0.15s ease-in-out",
                "&:hover": {
                  backgroundColor:
                    themeMode === "dark" ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9",
                },
              }}
            >
              <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: "var(--theme-primary)" }} />
              <span>{language === "th" ? "หน้าแนะนำระบบ (Overview)" : "System Overview"}</span>
            </MenuItem>

            {/* Settings MenuItem */}
            <MenuItem
              onClick={() => {
                handleCloseProfileMenu();
                setIsSettingsOpen(true);
              }}
              sx={{
                borderRadius: "12px",
                px: 1.5,
                py: 1,
                gap: 1.5,
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: themeMode === "dark" ? "#e2e8f0" : "#334155",
                transition: "all 0.15s ease-in-out",
                "&:hover": {
                  backgroundColor:
                    themeMode === "dark" ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9",
                },
              }}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>{t.settings.menuLabel}</span>
            </MenuItem>

            {/* Logout MenuItem */}
            <MenuItem
              onClick={() => {
                handleCloseProfileMenu();
                logout();
                navigate("/login");
              }}
              sx={{
                borderRadius: "12px",
                px: 1.5,
                py: 1,
                gap: 1.5,
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: themeMode === "dark" ? "#f87171" : "#dc2626",
                transition: "all 0.15s ease-in-out",
                "&:hover": {
                  backgroundColor:
                    themeMode === "dark" ? "rgba(239, 68, 68, 0.15)" : "#fef2f2",
                  color: themeMode === "dark" ? "#fca5a5" : "#b91c1c",
                },
              }}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>{t.sidebar.logout}</span>
            </MenuItem>
          </Menu>
        </div>
      </header>

      {/* Mobile Navigation Drawer (MUI Responsive) */}
      <Drawer
        anchor="left"
        open={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            maxWidth: '85vw',
            boxSizing: 'border-box',
            bgcolor: themeMode === 'dark' ? '#0d1017' : '#f8f7f4',
            borderRight: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #ebe7df',
            p: 1.5,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <img src={inkbrushLogo} alt="Logo" className="w-6 h-6 object-contain brightness-0 invert" />
            </div>
            <Box sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.common.appName}</Box>
          </Box>
          <IconButton onClick={() => setIsMobileNavOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
            <X className="w-4 h-4" />
          </IconButton>
        </Box>
        <Sidebar onNavigate={() => setIsMobileNavOpen(false)} isMobileDrawer />
      </Drawer>

      <div className="flex flex-1 min-h-0 overflow-hidden relative z-10">
        {/* Desktop Left Sidebar (MUI Responsive: hidden on mobile) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, height: '100%', flexShrink: 0 }}>
          <Sidebar />
        </Box>

        {/* Main View Port Container */}
        <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          <Outlet />
        </main>
      </div>

      {/* Settings Modal Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

/**
 * Route protector for POS layout: redirects unauthenticated users to /login
 */
const ProtectedLayout: React.FC = () => {
  const { currentUser } = usePos();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout />;
};

/**
 * Inner App component inside PosProvider and HashRouter
 */
const AppContent: React.FC = () => {
  const { themeMode, accentColor, fontFamily } = usePos();

  // Dynamic theme generated based on current themeMode, accentColor, and fontFamily
  const theme = useMemo(
    () => createAppTheme(themeMode, accentColor, fontFamily),
    [themeMode, accentColor, fontFamily]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* 1. Landing / Introduction Page (Default start page on entry) */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Authentication Login Screen */}
        <Route path="/login" element={<LoginScreen />} />

        {/* 3. Protected POS Application Screens (Dynamically generated from Central Feature Registry) */}
        <Route element={<ProtectedLayout />}>
          {FEATURE_REGISTRY.map((feat) => (
            <Route
              key={feat.id}
              path={`/${feat.path}`}
              element={
                feat.scrollableContainer ? (
                  <div className="flex-1 overflow-y-auto">{feat.component}</div>
                ) : (
                  feat.component
                )
              }
            />
          ))}
        </Route>

        {/* 4. Fallback: redirect any unknown URL to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <PosProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </PosProvider>
  );
}
