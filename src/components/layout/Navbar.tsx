import React from 'react';
import { usePos } from '../../context/PosContext';
import { Store, ShoppingCart, Package, BarChart3, LogOut, Clock, Sun, Moon } from 'lucide-react';
import manAvatar from '../../assets/man.png';
import womanAvatar from '../../assets/woman.jpg';

interface NavbarProps {
  currentTab: 'pos' | 'products' | 'sales';
  setCurrentTab: (tab: 'pos' | 'products' | 'sales') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, logout, cart, themeMode, toggleTheme, t } = usePos();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [time, setTime] = React.useState(() => new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isDark = themeMode === 'dark';

  return (
    <header className={`border-b sticky top-0 z-30 transition-colors duration-200 ${
      isDark ? 'bg-[#1a202c] border-[rgba(255,255,255,0.08)] text-slate-100' : 'bg-white border-[#ebe7df] text-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#5b8a72] flex items-center justify-center text-white shadow-sm shadow-[#5b8a72]/20">
            <Store className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-800 dark:text-slate-100">
                {t.common.appName}
              </span>
              <span className="hidden xs:inline-block text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#e8f3ee] text-[#387258] dark:bg-[#273931] dark:text-[#7eb99d] tracking-wider">
                {t.common.version}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>
                {time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className={`flex items-center p-1 rounded-2xl border overflow-x-auto ${
          isDark ? 'bg-[#232936] border-[rgba(255,255,255,0.06)]' : 'bg-[#f5f4ef] border-[#ebe7df]'
        }`}>
          <button
            onClick={() => setCurrentTab('pos')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'pos'
                ? isDark
                  ? 'bg-[#1a202c] text-[#7eb99d] shadow-sm'
                  : 'bg-white text-[#387258] shadow-2xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">{t.navbar.pos}</span>
            <span className="sm:hidden">{t.navbar.posShort}</span>
            {cartItemCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#e58a74] text-white text-[10px] sm:text-[11px] font-bold rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('products')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'products'
                ? isDark
                  ? 'bg-[#1a202c] text-[#7eb99d] shadow-sm'
                  : 'bg-white text-[#387258] shadow-2xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">{t.navbar.products}</span>
            <span className="sm:hidden">{t.navbar.productsShort}</span>
          </button>

          <button
            onClick={() => setCurrentTab('sales')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'sales'
                ? isDark
                  ? 'bg-[#1a202c] text-[#7eb99d] shadow-sm'
                  : 'bg-white text-[#387258] shadow-2xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">{t.navbar.salesReport}</span>
            <span className="sm:hidden">{t.navbar.salesReportShort}</span>
          </button>
        </nav>

        {/* Current Cashier Session Info & Theme Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={toggleTheme}
            title={isDark ? t.navbar.switchToLight : t.navbar.switchToDark}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'bg-[#1a202c] border-[rgba(255,255,255,0.1)] text-[#f4a28c] hover:bg-[#232936]'
                : 'bg-white border-[#ebe7df] text-slate-700 hover:bg-[#f5f4ef]'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#ebe7df] dark:border-[rgba(255,255,255,0.08)]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-[#c9e4d5] dark:border-[#387258] flex items-center justify-center flex-shrink-0">
              <img
                src={currentUser?.gender === 'female' ? womanAvatar : manAvatar}
                alt={currentUser?.name || "User Avatar"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden lg:block text-right">
              <div className="text-xs font-bold leading-tight">
                {currentUser?.name || t.sidebar.cashier}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {currentUser?.role === 'admin'
                  ? t.sidebar.admin
                  : currentUser?.role === 'manager'
                  ? t.sidebar.manager
                  : t.sidebar.cashier}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title={t.navbar.logout}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
