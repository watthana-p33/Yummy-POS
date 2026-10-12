import React, { useState, useMemo } from 'react';
import { usePos } from '../../context/PosContext';
import type { Customer } from '../../types/pos';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Search,
  X,
  User,
  UserPlus,
  Phone,
  Award,
  Check,
  UserCheck,
  Hash,
} from 'lucide-react';

export interface CustomerSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer | null) => void;
  selectedCustomerId?: string | null;
  onOpenAddCustomer?: () => void;
}

export const CustomerSearchDialog: React.FC<CustomerSearchDialogProps> = ({
  open,
  onClose,
  onSelectCustomer,
  selectedCustomerId,
  onOpenAddCustomer,
}) => {
  const { customers, themeMode, t } = usePos();
  const isDark = themeMode === 'dark';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [searchQuery, setSearchQuery] = useState('');

  // Filter customers based STRICTLY on name and phone number
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;

    const queryDigits = q.replace(/\D/g, '');

    return customers.filter((c) => {
      // 1. Match by name
      const matchesName = c.name.toLowerCase().includes(q);

      // 2. Match by phone
      let matchesPhone = false;
      if (c.phone) {
        const phoneLower = c.phone.toLowerCase();
        const phoneDigits = c.phone.replace(/\D/g, '');
        matchesPhone =
          phoneLower.includes(q) ||
          (queryDigits.length > 0 && phoneDigits.includes(queryDigits));
      }

      return matchesName || matchesPhone;
    });
  }, [customers, searchQuery]);

  const handleSelect = (customer: Customer | null) => {
    onSelectCustomer(customer);
    onClose();
    setSearchQuery('');
  };

  const handleClose = () => {
    onClose();
    setSearchQuery('');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(10px)',
            backgroundColor: isDark ? 'rgba(5, 7, 12, 0.7)' : 'rgba(15, 23, 42, 0.4)',
          },
        },
        paper: {
          elevation: 0,
          sx: {
            borderRadius: isMobile ? 0 : '28px',
            overflow: 'hidden',
            backgroundColor: isDark ? '#141822' : '#ffffff',
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #ebe7df',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
        },
      }}
    >
      <div className={`flex flex-col h-full max-h-[85vh] ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b flex items-center justify-between gap-3 ${
          isDark ? 'border-white/[0.08] bg-[#181d29]' : 'border-[#ebe7df] bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold tracking-tight truncate">
                {t.customers.selectCustomer}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {t.customers.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Quick Actions */}
        <div className={`p-4 sm:p-5 border-b space-y-3 ${
          isDark ? 'border-white/[0.06] bg-[#121620]' : 'border-[#ebe7df]/60 bg-white'
        }`}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.customers.searchPlaceholder}
                className={`w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border transition-all outline-none ${
                  isDark
                    ? 'bg-[#1b212e] border-white/[0.1] text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    : 'bg-slate-50 border-[#ebe7df] text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer flex-1 sm:flex-initial ${
                  !selectedCustomerId
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-sm'
                    : isDark
                      ? 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08]'
                      : 'bg-slate-100 border-[#ebe7df] text-slate-700 hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{t.customers.walkInCustomer}</span>
              </button>

              {onOpenAddCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenAddCustomer();
                  }}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer flex-1 sm:flex-initial"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t.customers.addCustomerBtn}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Customer Table Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[260px]">
          {filteredCustomers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] flex items-center justify-center text-slate-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t.customers.noCustomersFound}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                {t.customers.noCustomersMatch.replace('{query}', searchQuery)}
              </p>
              {onOpenAddCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenAddCustomer();
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-hover transition cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t.customers.addNewCustomerPrompt.replace('{query}', searchQuery)}</span>
                </button>
              )}
            </div>
          ) : (
            <div className={`overflow-x-auto rounded-2xl border ${
              isDark ? 'border-white/[0.08] bg-[#161b26]' : 'border-[#ebe7df] bg-white'
            }`}>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDark
                      ? 'border-white/[0.08] bg-white/[0.02] text-slate-400'
                      : 'border-[#ebe7df] bg-slate-50 text-slate-500'
                  }`}>
                    <th className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-slate-400" />
                        <span>{t.customers.customerId}</span>
                      </div>
                    </th>
                    <th className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{t.customers.name}</span>
                      </div>
                    </th>
                    <th className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{t.customers.phone}</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span>{t.customers.points}</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center">{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-[#ebe7df]/70'}`}>
                  {filteredCustomers.map((c) => {
                    const isSelected = selectedCustomerId === c.id;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => handleSelect(c)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected
                            ? isDark
                              ? 'bg-primary/15 hover:bg-primary/20'
                              : 'bg-primary/10 hover:bg-primary/15'
                            : isDark
                              ? 'hover:bg-white/[0.03]'
                              : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Customer ID */}
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {c.id}
                        </td>

                        {/* Name */}
                        <td className="py-3 px-4 font-semibold whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`${isSelected ? 'text-primary font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                              {c.name}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-primary text-white">
                                {t.customers.currentBadge}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {c.phone ? (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {c.phone}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>

                        {/* Points */}
                        <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px]">
                            <Award className="w-3 h-3" />
                            {c.points.toLocaleString()} {t.common.points}
                          </span>
                        </td>

                        {/* Select Action Button */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                              <Check className="w-4 h-4" />
                              <span>{t.customers.selectedBadge}</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(c);
                              }}
                              className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-primary hover:text-white dark:bg-white/[0.06] dark:hover:bg-primary text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-2xs group-hover:bg-primary group-hover:text-white"
                            >
                              {t.customers.selectBtn}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 sm:px-6 py-3 border-t flex items-center justify-between gap-3 text-xs ${
          isDark ? 'border-white/[0.08] bg-[#181d29] text-slate-400' : 'border-[#ebe7df] bg-slate-50 text-slate-500'
        }`}>
          <div>
            {t.customers.totalFiltered
              ? t.customers.totalFiltered
                  .replace('{count}', String(filteredCustomers.length))
                  .replace('{total}', String(customers.length))
              : `ทั้งหมด ${filteredCustomers.length} รายการ (จาก ${customers.length} คน)`}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className={`px-4 py-1.5 rounded-xl font-semibold border transition cursor-pointer ${
              isDark
                ? 'bg-white/[0.04] border-white/[0.1] text-slate-300 hover:bg-white/[0.08]'
                : 'bg-white border-[#ebe7df] text-slate-700 hover:bg-slate-100'
            }`}
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
