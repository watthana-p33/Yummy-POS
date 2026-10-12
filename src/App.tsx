import React, { useState, useMemo, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { createAppTheme } from "./theme/theme";
import { PosProvider, usePos, hasMenuPermission } from "./context/PosContext";
import { LogOut, Settings, Sun, Moon, Languages } from "lucide-react";
import { LoginScreen } from "./components/LoginScreen";
import { Sidebar } from "./components/Sidebar";
import { PosScreen } from "./components/PosScreen";
import { ProductManagementScreen } from "./components/ProductManagementScreen";
import { ShiftScreen } from "./components/ShiftScreen";
import { StaffManagementScreen } from "./components/StaffManagementScreen";
import { SalesHistoryScreen } from "./components/SalesHistoryScreen";
import { ReportsScreen } from "./components/ReportsScreen";
import { SettingsModal, LiquidBackground } from "./components/common";
import inkbrushLogo from './assets/inkbrush-person-sending-money.svg';
import manAvatar from './assets/man.png';
import womanAvatar from './assets/woman.jpg';

const getUserAvatar = (user?: { gender?: 'male' | 'female'; avatar?: string } | null) => {
  if (user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'))) {
    return user.avatar;
  }
  return user?.gender === 'female' ? womanAvatar : manAvatar;
};

const MainApp: React.FC = () => {
  const { currentUser, logout, themeMode, toggleTheme, accentColor, fontFamily, t, language, toggleLanguage } = usePos();
  const [currentTab, setCurrentTab] = useState<
    "pos" | "products" | "shifts" | "staff" | "sales" | "reports"
  >("pos");
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null);
  };

  // Guard: Automatically redirect to first allowed tab if currentTab is restricted
  useEffect(() => {
    if (currentUser && !hasMenuPermission(currentUser, currentTab)) {
      const allTabs: Array<"pos" | "products" | "shifts" | "staff" | "sales" | "reports"> =
        ["pos", "products", "shifts", "staff", "sales", "reports"];
      const firstAllowed =
        allTabs.find((tab) => hasMenuPermission(currentUser, tab)) || "pos";
      setCurrentTab(firstAllowed);
    }
  }, [currentUser, currentTab]);

  // Dynamic theme generated based on current themeMode, accentColor, and fontFamily
  const theme = useMemo(
    () => createAppTheme(themeMode, accentColor, fontFamily),
    [themeMode, accentColor, fontFamily]
  );


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!currentUser ? (
        <LoginScreen />
      ) : (
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
          <header className="h-[60px] px-3 liquid-glass-panel flex items-center justify-between gap-4 flex-shrink-0 z-30">
            <div className="flex items-center gap-3 min-w-0">
              {/* Brand Logo */}
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0 transition-all duration-300"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  boxShadow: '0 4px 14px var(--theme-primary-border), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
                }}
              >
                {/* <Store className="w-5 h-5" /> */}
                <img
                  src={inkbrushLogo}
                  alt="Logo"
                  className="w-8 h-8 object-contain brightness-0 invert"
                />
              </div>

              {/* Animated Brand Title & Subtitle */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-[#2d3748] dark:text-[#f7fafc] truncate">
                    {t.common.appName}
                  </span>
                  <span
                    className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full tracking-wider flex-shrink-0 transition-colors duration-300"
                    style={{
                      backgroundColor: 'var(--theme-primary-light)',
                      color: 'var(--theme-primary-text)',
                    }}
                  >
                    {t.common.version}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">
                  {t.common.appSubtitle}
                </p>
              </div>
            </div>

            {/* Right actions: Theme Toggle + Cashier Avatar */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2">
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
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/60 dark:border-white/20 flex-shrink-0 shadow-2xs bg-white">
                      <img
                        src={getUserAvatar(currentUser)}
                        alt={currentUser?.name || "User Avatar"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 max-w-[200px] truncate select-none">
                    {currentUser?.name || t.sidebar.cashier}
                  </span>
                </div>

              <span className="text-2xl font-medium text-slate-500 dark:text-slate-400">|</span>

              {/* Header Theme Toggle Button (Light / Dark) */}
              <Tooltip title={themeMode === 'dark' ? t.sidebar.switchToLight : t.sidebar.switchToDark} placement="bottom">
                <button
                  type="button"
                  data-testid="header-theme-toggle-btn"
                  onClick={toggleTheme}
                  className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-xs ${
                    themeMode === 'dark'
                      ? 'bg-white/10 hover:bg-white/18 border-white/15 text-amber-300'
                      : 'bg-white/80 hover:bg-white border-black/5 text-slate-700 hover:text-slate-900'
                  }`}
                  aria-label="Toggle light/dark theme"
                >
                  {themeMode === 'dark' ? (
                    <Sun className="w-4 h-4 transition-transform duration-200 hover:rotate-45" />
                  ) : (
                    <Moon className="w-4 h-4 transition-transform duration-200 hover:-rotate-12" />
                  )}
                </button>
              </Tooltip>

              {/* Header Language Switcher Button (TH / EN) */}
              <Tooltip title={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'} placement="bottom">
                <button
                  type="button"
                  data-testid="header-lang-toggle-btn"
                  onClick={toggleLanguage}
                  className={`h-9 px-2.5 rounded-2xl border flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 shadow-xs text-xs font-semibold select-none ${
                    themeMode === 'dark'
                      ? 'bg-white/10 hover:bg-white/18 border-white/15 text-slate-200'
                      : 'bg-white/80 hover:bg-white border-black/5 text-slate-700 hover:text-slate-900'
                  }`}
                  aria-label="Toggle language"
                >
                  <Languages className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--theme-primary)' }} />
                  <span className={language === 'th' ? 'font-bold underline text-primary-text' : 'opacity-60 font-normal'}>TH</span>
                  <span className="text-slate-300 dark:text-slate-600 font-light">|</span>
                  <span className={language === 'en' ? 'font-bold underline text-primary-text' : 'opacity-60 font-normal'}>EN</span>
                </button>
              </Tooltip>

              

              {/* MUI Menu Custom Styled */}
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

                {/* Divider */}
                <Divider
                  sx={{
                    my: 1.5,
                    borderColor:
                      themeMode === "dark" ? "rgba(255, 255, 255, 0.08)" : "#ebe7df",
                  }}
                />


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

          <div className="flex flex-1 min-h-0 overflow-hidden relative z-10">
            {/* Left Sidebar Menu Navigation */}
            <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

            {/* Main View Port Container */}
            <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
              {currentTab === "pos" && <PosScreen />}
              {currentTab === "products" && (
                <div className="flex-1 overflow-y-auto">
                  <ProductManagementScreen />
                </div>
              )}
              {currentTab === "shifts" && (
                <div className="flex-1 overflow-y-auto">
                  <ShiftScreen />
                </div>
              )}
              {currentTab === "staff" && (
                <div className="flex-1 overflow-y-auto">
                  <StaffManagementScreen />
                </div>
              )}
              {currentTab === "sales" && (
                <div className="flex-1 overflow-y-auto">
                  <SalesHistoryScreen />
                </div>
              )}
              {currentTab === "reports" && (
                <div className="flex-1 overflow-y-auto">
                  <ReportsScreen />
                </div>
              )}
            </main>
          </div>

          {/* Settings Modal Dialog (Global Top-Level Overlay) */}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </div>
      )}
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <PosProvider>
      <MainApp />
    </PosProvider>
  );
}
