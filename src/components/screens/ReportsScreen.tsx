import React, { useState, useMemo } from 'react';
import { usePos } from '../../context/PosContext';
import { exportSalesReportToExcel } from '../../utils/excelExport';
import {
  ScrollText,
  Calendar,
  Filter,
  Download,
  CheckSquare,
  Square,
  X,
} from 'lucide-react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  MenuItem,
} from '@mui/material';
import { PosCard, PosTableContainer, PosSelect, PageHeader, PageContainer } from '../common';

const CURRENT_YEAR = String(new Date().getFullYear());

export const ReportsScreen: React.FC = () => {
  const { orders, products, themeMode, t, language } = usePos();
  const isDark = themeMode === 'dark';

  const [periodType, setPeriodType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]); // Empty = All products

  // Available years from existing orders + current year
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    orders.forEach((o) => {
      if (o.timestamp) {
        const d = new Date(o.timestamp);
        if (!isNaN(d.getTime())) {
          yearsSet.add(String(d.getFullYear()));
        }
      }
    });
    yearsSet.add(CURRENT_YEAR);
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [orders]);

  const monthOptions = useMemo(
    () => [
      { value: '01', labelTh: '01 - มกราคม', labelEn: '01 - January' },
      { value: '02', labelTh: '02 - กุมภาพันธ์', labelEn: '02 - February' },
      { value: '03', labelTh: '03 - มีนาคม', labelEn: '03 - March' },
      { value: '04', labelTh: '04 - เมษายน', labelEn: '04 - April' },
      { value: '05', labelTh: '05 - พฤษภาคม', labelEn: '05 - May' },
      { value: '06', labelTh: '06 - มิถุนายน', labelEn: '06 - June' },
      { value: '07', labelTh: '07 - กรกฎาคม', labelEn: '07 - July' },
      { value: '08', labelTh: '08 - สิงหาคม', labelEn: '08 - August' },
      { value: '09', labelTh: '09 - กันยายน', labelEn: '09 - September' },
      { value: '10', labelTh: '10 - ตุลาคม', labelEn: '10 - October' },
      { value: '11', labelTh: '11 - พฤศจิกายน', labelEn: '11 - November' },
      { value: '12', labelTh: '12 - ธันวาคม', labelEn: '12 - December' },
    ],
    []
  );

  const toggleProductSelect = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAllProducts = () => {
    setSelectedProductIds([]);
  };

  // Group orders by month (YYYY-MM) or year (YYYY) filtered by selectedYear & selectedMonth
  const reportData = useMemo(() => {
    const summaryMap: Record<
      string,
      {
        period: string;
        orderCount: number;
        totalQty: number;
        revenue: number;
        productBreakdown: Record<string, { name: string; qty: number; revenue: number }>;
      }
    > = {};

    orders.forEach((order) => {
      const date = new Date(order.timestamp);
      const orderYear = String(date.getFullYear());
      const orderMonth = String(date.getMonth() + 1).padStart(2, '0');

      // Filter by selected year
      if (selectedYear !== 'all' && orderYear !== selectedYear) {
        return;
      }

      // Filter by selected month (only applicable in monthly view mode)
      if (periodType === 'monthly' && selectedMonth !== 'all' && orderMonth !== selectedMonth) {
        return;
      }

      const periodKey =
        periodType === 'monthly'
          ? `${orderYear}-${orderMonth}`
          : `${orderYear}`;

      if (!summaryMap[periodKey]) {
        summaryMap[periodKey] = {
          period: periodKey,
          orderCount: 0,
          totalQty: 0,
          revenue: 0,
          productBreakdown: {},
        };
      }

      let orderHasMatchingProduct = false;

      order.items.forEach((item) => {
        const matchesSelection =
          selectedProductIds.length === 0 || selectedProductIds.includes(item.productId);

        if (matchesSelection) {
          orderHasMatchingProduct = true;
          summaryMap[periodKey].totalQty += item.quantity;
          summaryMap[periodKey].revenue += item.subtotal;

          if (!summaryMap[periodKey].productBreakdown[item.name]) {
            summaryMap[periodKey].productBreakdown[item.name] = {
              name: item.name,
              qty: 0,
              revenue: 0,
            };
          }
          summaryMap[periodKey].productBreakdown[item.name].qty += item.quantity;
          summaryMap[periodKey].productBreakdown[item.name].revenue += item.subtotal;
        }
      });

      if (orderHasMatchingProduct) {
        summaryMap[periodKey].orderCount += 1;
      }
    });

    return Object.values(summaryMap).sort((a, b) => b.period.localeCompare(a.period));
  }, [orders, periodType, selectedYear, selectedMonth, selectedProductIds]);

  const totalFilteredRevenue = useMemo(() => {
    return reportData.reduce((sum, r) => sum + r.revenue, 0);
  }, [reportData]);

  const totalFilteredUnits = useMemo(() => {
    return reportData.reduce((sum, r) => sum + r.totalQty, 0);
  }, [reportData]);

  const totalOrdersCount = useMemo(() => {
    return reportData.reduce((sum, r) => sum + r.orderCount, 0);
  }, [reportData]);

  // Export to Excel with custom Yummy POS theme styling and current filters
  const handleExportExcel = () => {
    exportSalesReportToExcel({
      periodType,
      reportData,
      totalFilteredRevenue,
      totalFilteredUnits,
      totalOrdersCount,
      currency: t.common.currency || '฿',
      storeName: t.common.appName || 'Yummy POS',
      branchName: t.pos?.storeBranch || 'สาขาหลัก Central Food Court',
      filterYear: selectedYear,
      filterMonth: periodType === 'monthly' ? selectedMonth : 'all',
    });
  };

  return (
    <PageContainer>
      {/* Top Banner Header */}
      <PageHeader
        icon={<ScrollText className="w-6 h-6" />}
        title={t.reports.title}
        subtitle={t.reports.subtitle}
        actions={
          <button
            onClick={handleExportExcel}
            className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer flex items-center gap-2 text-white shadow-md relative overflow-hidden liquid-gloss"
            style={{
              background: `linear-gradient(135deg, var(--theme-primary), var(--theme-primary-hover))`,
              boxShadow: `0 6px 20px -3px var(--theme-primary)`,
            }}
          >
            <Download className="w-4 h-4" />
            {t.reports.exportExcelBtn}
          </button>
        }
      />

      {/* Control Filters Bar */}
      <PosCard className="p-5 border space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
          {/* Controls: Mode switcher + Year selector + Month selector */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Monthly / Yearly Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {t.reports.viewMode}:
              </span>
              <div className="flex items-center h-[38px] p-1 rounded-xl border liquid-glass-panel box-border">
                <button
                  type="button"
                  onClick={() => setPeriodType('monthly')}
                  className={`h-full flex items-center px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    periodType === 'monthly'
                      ? 'bg-white/80 dark:bg-white/20 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.reports.monthlySummary}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodType('yearly')}
                  className={`h-full flex items-center px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    periodType === 'yearly'
                      ? 'bg-white/80 dark:bg-white/20 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.reports.yearlySummary}
                </button>
              </div>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {t.reports.selectYear}:
              </span>
              <div className="w-36">
                <PosSelect
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value as string)}
                  size="small"
                  sx={{ height: '38px', minHeight: '38px' }}
                >
                  <MenuItem value="all">{t.reports.allYears}</MenuItem>
                  {availableYears.map((yr) => (
                    <MenuItem key={yr} value={yr}>
                      {yr}
                    </MenuItem>
                  ))}
                </PosSelect>
              </div>
            </div>

            {/* Month Selector (shown in monthly mode) */}
            {periodType === 'monthly' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {t.reports.selectMonth}:
                </span>
                <div className="w-48">
                  <PosSelect
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value as string)}
                    size="small"
                    sx={{ height: '38px', minHeight: '38px' }}
                  >
                    <MenuItem value="all">{t.reports.allMonths}</MenuItem>
                    {monthOptions.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {language === 'th' ? m.labelTh : m.labelEn}
                      </MenuItem>
                    ))}
                  </PosSelect>
                </div>
              </div>
            )}

            {/* Reset / Clear Filters button */}
            {(selectedYear !== 'all' || (periodType === 'monthly' && selectedMonth !== 'all')) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedYear('all');
                  setSelectedMonth('all');
                }}
                className="h-[38px] px-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer flex items-center gap-1 box-border"
                title={t.reports.clearFilters}
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.reports.clearFilters}</span>
              </button>
            )}
          </div>

          {/* KPI Summary badges */}
          <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">{t.reports.unitsSoldLabel}:</span>
              <span
                className="px-2 py-0.5 rounded-md font-bold border"
                style={{
                  backgroundColor: 'var(--theme-primary-light)',
                  color: 'var(--theme-primary-text)',
                  borderColor: 'var(--theme-primary-border)',
                }}
              >
                {totalFilteredUnits.toLocaleString()} {t.common.items}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">{t.reports.filteredRevenueLabel}:</span>
              <span
                className="text-base font-extrabold"
                style={{ color: 'var(--theme-primary)' }}
              >
                ฿{totalFilteredRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Product Selection Filter Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
              {t.reports.filterByProducts}
            </span>
            <button
              onClick={selectAllProducts}
              className={`text-[11px] font-semibold underline cursor-pointer ${
                selectedProductIds.length === 0 ? 'text-primary' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.reports.allProducts}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
            {products.map((p) => {
              const isSelected = selectedProductIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProductSelect(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'text-white'
                      : isDark
                      ? 'bg-[#1a202c] border-[rgba(255,255,255,0.08)] text-slate-300 hover:bg-[#232936]'
                      : 'bg-white border-[#ebe7df] text-slate-700 hover:bg-[#f5f4ef]'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: 'var(--theme-primary)',
                          borderColor: 'var(--theme-primary)',
                        }
                      : undefined
                  }
                >
                  {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 opacity-50" />}
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </PosCard>

      {/* Report Data Table */}
      <PosCard className="p-5 sm:p-6 border">
        <PosTableContainer variant="embedded">
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: 'transparent',
                  '& th': {
                    borderColor: isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'var(--theme-primary-border)',
                    color: isDark ? 'rgba(255, 255, 255, 0.75)' : 'var(--theme-primary-text)',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    py: 1.85,
                    px: 2.5,
                  },
                }}
              >
                <TableCell>{t.reports.period}</TableCell>
                <TableCell>{t.reports.ordersCountHeader}</TableCell>
                <TableCell>{t.reports.unitsSold}</TableCell>
                <TableCell align="right">{t.reports.revenue}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{
                      py: 6,
                      color: isDark ? 'rgba(255, 255, 255, 0.4)' : '#a0aec0',
                      border: 0,
                    }}
                  >
                    {t.reports.noSalesInPeriod}
                  </TableCell>
                </TableRow>
              ) : (
                reportData.map((row) => (
                  <React.Fragment key={row.period}>
                    <TableRow
                      sx={{
                        transition: 'background-color 0.2s ease',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(245, 244, 239, 0.5)',
                        '&:hover': {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(245, 244, 239, 0.85)',
                        },
                        '& td': {
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(240, 238, 233, 0.9)',
                          py: 1.75,
                          px: 2.5,
                          fontWeight: 700,
                          color: isDark ? '#f7fafc' : '#2d3748',
                        },
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                          <span>{row.period}</span>
                        </div>
                      </TableCell>
                      <TableCell sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#64748b' }}>
                        {row.orderCount} {t.common.orders}
                      </TableCell>
                      <TableCell sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#64748b' }}>
                        {row.totalQty} {t.common.items}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '1rem',
                          color: 'var(--theme-primary) !important',
                        }}
                      >
                        ฿{row.revenue.toLocaleString()}
                      </TableCell>
                    </TableRow>

                    {/* Items breakdown sub-rows */}
                    {Object.values(row.productBreakdown).map((item) => (
                      <TableRow
                        key={item.name}
                        sx={{
                          backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.4)',
                          '& td': {
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(245, 244, 239, 0.7)',
                            py: 1.2,
                            px: 2.5,
                            fontSize: '0.75rem',
                            color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b',
                          },
                        }}
                      >
                        <TableCell sx={{ pl: 5 }}>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">↳</span>
                            <span>{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>{item.qty} {t.common.items}</TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                          ฿{item.revenue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </PosTableContainer>
      </PosCard>
    </PageContainer>
  );
};
