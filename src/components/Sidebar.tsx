import React from 'react';
import { usePos, hasMenuPermission } from '../context/PosContext';
import {
  ShoppingCart,
  Package,
  Clock,
  BarChart3,
  Users,
  FileSpreadsheet,
  ChevronRight,
} from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';

interface SidebarProps {
  currentTab: 'pos' | 'products' | 'shifts' | 'staff' | 'sales' | 'reports';
  setCurrentTab: (tab: 'pos' | 'products' | 'shifts' | 'staff' | 'sales' | 'reports') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, cart, themeMode, t } = usePos();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    return localStorage.getItem('yummy_pos_sidebar_collapsed') === 'true';
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('yummy_pos_sidebar_collapsed', String(next));
      return next;
    });
  };

  const isDark = themeMode === 'dark';

  const menuItems: Array<{
    id: 'pos' | 'products' | 'shifts' | 'staff' | 'sales' | 'reports';
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'pos',
      label: t.sidebar.posTab,
      sublabel: t.sidebar.posSub,
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
    {
      id: 'products',
      label: t.sidebar.productsTab,
      sublabel: t.sidebar.productsSub,
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: 'shifts',
      label: t.sidebar.shiftsTab,
      sublabel: t.sidebar.shiftsSub,
      icon: <Clock className="w-5 h-5" />,
    },
    {
      id: 'staff',
      label: t.sidebar.staffTab,
      sublabel: t.sidebar.staffSub,
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'sales',
      label: t.sidebar.salesTab,
      sublabel: t.sidebar.salesSub,
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: t.sidebar.reportsTab,
      sublabel: t.sidebar.reportsSub,
      icon: <FileSpreadsheet className="w-5 h-5" />,
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } flex-shrink-0 flex flex-col h-full sticky top-0 z-40 select-none transition-all duration-300 ease-in-out liquid-glass-panel border-r border-white/30 dark:border-white/10 relative`}
    >
      {/* Liquid Organic Pebble Collapse / Expand Toggle Button */}
      <div className="h-full absolute -right-[14px] flex items-center z-50">
        <Tooltip title={isCollapsed ? t.sidebar.expandSidebar : t.sidebar.collapseSidebar} placement="right">
          <button
            data-testid="toggle-sidebar-collapse-btn"
            onClick={toggleCollapsed}
            className={`p-1.5 text-slate-500 dark:text-slate-200 border ${
              isDark
                ? 'bg-[#151922]/90 border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]'
                : 'bg-white/95 border-white shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,1)]'
            } hover:text-primary hover:border-primary/50 backdrop-blur-md cursor-pointer flex-shrink-0 ${
              isCollapsed ? '' : 'rotate-180'
            } transition-all duration-300 ease-out hover:scale-110 active:scale-95`}
            style={{ borderRadius: '53% 47% 55% 45% / 48% 54% 46% 52%' }}
          >
            <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200" />
          </button>
        </Tooltip>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-1.5 overflow-y-auto overflow-x-hidden flex flex-col items-center">
        {/* Section title */}
        <div
          className={`w-full text-left px-3.5 overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap text-[10px] font-bold tracking-[0.18em] text-slate-400 dark:text-slate-500 uppercase ${
            isCollapsed ? 'max-h-0 opacity-0 py-0' : 'max-h-8 opacity-100 py-2'
          }`}
        >
          {t.sidebar.mainMenu}
        </div>

        {menuItems
          .filter((item) => hasMenuPermission(currentUser, item.id))
          .map((item) => {
            const isActive = currentTab === item.id;
            return (
              <Tooltip
                key={item.id}
                title={isCollapsed ? `${item.label} (${item.sublabel})` : ''}
                placement="right"
                disableHoverListener={!isCollapsed}
              >
                <button
                  onClick={() => setCurrentTab(item.id)}
                  className={`min-h-[48px] flex items-center transition-all duration-200 ease-in-out cursor-pointer text-left group relative ${
                    isCollapsed ? 'justify-center px-0 w-[48px]' : 'justify-start px-2.5 w-full'
                  } ${
                    isActive
                      ? isDark
                        ? 'text-white'
                        : 'text-slate-900'
                      : isDark
                      ? 'text-slate-400'
                      : 'text-slate-600'
                  }`}
                >
                  {/* Icon container with solid accent pebble on active */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 relative ${
                      isActive
                        ? 'text-white shadow-xs'
                        : isDark
                        ? 'text-slate-400 group-hover:text-slate-200'
                        : 'text-slate-500 group-hover:text-slate-800'
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: 'var(--theme-primary)' }
                        : undefined
                    }
                  >
                    <span className="transition-transform duration-200 group-hover:scale-105">
                      {item.icon}
                    </span>

                    {/* Droplet badge when collapsed */}
                    {item.badge !== undefined && (
                      <span
                        className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs transition-all duration-200 ${
                          isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
                        }`}
                        style={{ backgroundColor: 'var(--theme-primary)' }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Text Label & Sublabel */}
                  <div
                    className={`min-w-0 flex-1 overflow-hidden transition-all duration-200 ease-in-out whitespace-nowrap ${
                      isCollapsed
                        ? 'max-w-0 opacity-0 -translate-x-3 pointer-events-none ml-0'
                        : 'max-w-[140px] opacity-100 translate-x-0 ml-2.5'
                    }`}
                  >
                    <div
                      className={`text-xs sm:text-sm font-semibold truncate leading-tight ${
                        isActive
                          ? isDark ? 'text-white' : 'text-slate-900'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[10px] font-normal truncate mt-0.5 text-slate-400 dark:text-slate-500">
                      {item.sublabel}
                    </div>
                  </div>

                  {/* Badge when expanded */}
                  {item.badge !== undefined && (
                    <div
                      className={`overflow-hidden transition-all duration-200 ease-in-out ${
                        isCollapsed ? 'max-w-0 opacity-0 scale-50 ml-0' : 'max-w-[40px] opacity-100 scale-100 ml-2'
                      }`}
                    >
                      <span
                        className="px-2 py-0.5 text-white text-[11px] font-bold rounded-full shadow-xs"
                        style={{ backgroundColor: 'var(--theme-primary)' }}
                      >
                        {item.badge}
                      </span>
                    </div>
                  )}
                </button>
              </Tooltip>
            );
          })}
      </nav>
    </aside>
  );
};
