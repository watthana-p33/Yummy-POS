import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import type { Shift } from '../types/pos';
import {
  Clock,
  Unlock,
  Lock,
  History,
  Coins,
  Receipt,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { PosCard, PosTable, type PosTableColumn, ShiftModal } from './common';

export const ShiftScreen: React.FC = () => {
  const { currentShift, shifts, themeMode, t } = usePos();
  const isDark = themeMode === 'dark';
  const [shiftModalMode, setShiftModalMode] = useState<'open' | 'close' | null>(null);

  const expectedCashInDrawer = currentShift
    ? currentShift.startingCash + currentShift.totalSales
    : 0;

  const shiftColumns: PosTableColumn<Shift>[] = [
    {
      id: 'cashier',
      header: t.shifts.shiftBy,
      sortKey: 'cashierName',
      render: (s) => <span className="font-semibold text-slate-800 dark:text-slate-200">{s.cashierName}</span>,
    },
    {
      id: 'date',
      header: t.shifts.date,
      sortKey: 'startTime',
      render: (s) => (
        <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
          {new Date(s.startTime).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      id: 'startTime',
      header: t.shifts.openTime,
      render: (s) => (
        <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono">
          {new Date(s.startTime).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      id: 'endTime',
      header: t.shifts.closeTime,
      render: (s) => (
        <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono">
          {s.endTime
            ? new Date(s.endTime).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-'}
        </span>
      ),
    },
    {
      id: 'startingCash',
      header: t.shifts.startingCash,
      align: 'right',
      render: (s) => (
        <span className="font-mono font-semibold">฿{s.startingCash.toLocaleString()}</span>
      ),
    },
    {
      id: 'totalSales',
      header: t.shifts.shiftSales,
      align: 'right',
      render: (s) => (
        <span
          className="font-mono font-bold"
          style={{ color: 'var(--theme-primary)' }}
        >
          ฿{s.totalSales.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'endingCash',
      header: t.shifts.countedCash,
      align: 'right',
      render: (s) => (
        <span className="font-mono font-semibold">
          {s.endingCash !== undefined ? `฿${s.endingCash.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      id: 'status',
      header: t.shifts.status,
      align: 'center',
      filterOptions: [
        { label: t.shifts.statusOpen, value: 'open' },
        { label: t.shifts.statusClosed, value: 'closed' },
      ],
      render: (s) => (
        <span
          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-colors inline-block"
          style={
            s.status === 'open'
              ? {
                  backgroundColor: 'var(--theme-primary-light)',
                  color: 'var(--theme-primary-text)',
                  borderColor: 'var(--theme-primary-border)',
                }
              : {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                  color: isDark ? '#94a3b8' : '#64748b',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                }
          }
        >
          {s.status === 'open' ? t.shifts.statusOpen : t.shifts.statusClosed}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 min-h-screen bg-transparent">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span
              className="p-2.5 rounded-2xl text-white shadow-md relative overflow-hidden liquid-gloss"
              style={{
                background: `linear-gradient(135deg, var(--theme-primary), var(--theme-primary-hover))`,
                boxShadow: `0 6px 18px -3px var(--theme-primary)`,
              }}
            >
              <Clock className="w-6 h-6" />
            </span>
            {t.sidebar.shiftsTab}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.sidebar.shiftsSub}
          </p>
        </div>

        {/* Quick Shift Action Button */}
        <div>
          {currentShift ? (
            <button
              onClick={() => setShiftModalMode('close')}
              className="px-4 py-2.5 bg-[#e58a74] hover:bg-[#d67963] text-white rounded-2xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 shadow-xs active:scale-95"
            >
              <Lock className="w-4 h-4" />
              {t.staff.closeShiftBtn}
            </button>
          ) : (
            <button
              onClick={() => setShiftModalMode('open')}
              className="px-4 py-2.5 text-white rounded-2xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 shadow-xs active:scale-95 hover:opacity-90"
              style={{
                backgroundColor: 'var(--theme-primary)',
                boxShadow: '0 4px 14px var(--theme-primary-border)',
              }}
            >
              <Unlock className="w-4 h-4" />
              {t.staff.openShiftBtn}
            </button>
          )}
        </div>
      </div>

      {/* Active Shift Status Card */}
      <PosCard className="p-5 sm:p-6 border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#ebe7df] dark:border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-colors duration-200 ${
                currentShift ? '' : 'bg-slate-400'
              }`}
              style={currentShift ? { backgroundColor: 'var(--theme-primary)' } : undefined}
            >
              {currentShift ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {t.staff.currentShiftTitle}
                </h2>
                <span
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border transition-colors"
                  style={
                    currentShift
                      ? {
                          backgroundColor: 'var(--theme-primary-light)',
                          color: 'var(--theme-primary-text)',
                          borderColor: 'var(--theme-primary-border)',
                        }
                      : {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                          color: isDark ? '#94a3b8' : '#64748b',
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                        }
                  }
                >
                  {currentShift ? t.sidebar.activeShift : t.sidebar.shiftClosed}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentShift
                  ? `${t.shifts.shiftBy}: ${currentShift.cashierName} • ${t.shifts.openTime}: ${new Date(
                      currentShift.startTime
                    ).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
                  : t.staff.noActiveShift}
              </p>
            </div>
          </div>
        </div>

        {/* Shift Financial Stats */}
        {currentShift ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
            <div className="p-4 rounded-2xl border liquid-glass-card">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t.staff.startingCash}
                </span>
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 block">
                ฿{currentShift.startingCash.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl border liquid-glass-card">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t.staff.totalShiftSales}
                </span>
              </div>
              <span
                className="text-xl font-bold block"
                style={{ color: 'var(--theme-primary)' }}
              >
                ฿{currentShift.totalSales.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl border liquid-glass-card">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t.staff.totalOrdersCount}
                </span>
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 block">
                {currentShift.totalOrders} {t.common.orders}
              </span>
            </div>

            <div className="p-4 rounded-2xl border liquid-glass-card">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t.staff.expectedCash}
                </span>
              </div>
              <span
                className="text-xl font-bold block"
                style={{ color: 'var(--theme-primary)' }}
              >
                ฿{expectedCashInDrawer.toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="pt-6 pb-2 text-center text-slate-400 text-sm">
            {t.shifts.openShiftPrompt}
          </div>
        )}
      </PosCard>

      {/* Shift History Table */}
      <PosCard className="p-5 sm:p-6 border">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <History className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
          {t.shifts.historyTitle}
        </h3>

        <PosTable
          columns={shiftColumns}
          data={shifts}
          keyExtractor={(s) => s.id}
          emptyMessage={t.shifts.noHistory}
          variant="embedded"
          minWidth={650}
          enableFilter
        />
      </PosCard>

      {/* Shift Modal (Open / Close) */}
      {shiftModalMode && (
        <ShiftModal
          isOpen={Boolean(shiftModalMode)}
          mode={shiftModalMode}
          onClose={() => setShiftModalMode(null)}
        />
      )}
    </div>
  );
};
