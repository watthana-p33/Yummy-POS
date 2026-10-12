import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import type { Order } from '../types/pos';
import { PosCard } from './common';
import { ACCENT_THEMES } from '../theme/theme';
import { BarChart, PieChart } from '@mui/x-charts';
import {
  TrendingUp,
  DollarSign,
  Award,
  CreditCard,
  Banknote,
  QrCode,
  Calendar,
  Clock,
  Percent,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';

interface SalesChartsSectionProps {
  orders: Order[];
}

export const SalesChartsSection: React.FC<SalesChartsSectionProps> = ({ orders }) => {
  const { themeMode, accentColor, t } = usePos();
  const isDark = themeMode === 'dark';

  // Toggle Collapse / Expand
  const [isExpanded, setIsExpanded] = useState(true);

  // View Mode for Sales & Profit Trend: 'time' (by hour/receipt) vs 'day' (by calendar date)
  const [trendViewMode, setTrendViewMode] = useState<'time' | 'day'>('time');

  // Active theme color token
  const activeTheme = ACCENT_THEMES[accentColor] || ACCENT_THEMES.sage;
  const primaryColor = isDark ? activeTheme.primaryDark : activeTheme.primaryLight;
  const profitColor = isDark ? '#34d399' : '#10b981'; // Emerald
  const costColor = isDark ? '#94a3b8' : '#64748b'; // Slate

  // --- 1. Aggregations & Metrics ---
  const {
    totalRevenue,
    totalProfit,
    profitMarginPercent,
    topSellingProducts,
    paymentMethodData,
    trendChartData,
  } = useMemo(() => {
    let rev = 0;
    let cost = 0;
    const itemMap: Record<string, { name: string; quantity: number; revenue: number; cost: number }> = {};
    const paymentMap: Record<string, { count: number; total: number }> = {
      promptpay: { count: 0, total: 0 },
      cash: { count: 0, total: 0 },
      credit_card: { count: 0, total: 0 },
    };

    // Trend grouping maps
    const dayMap: Record<string, { label: string; revenue: number; profit: number; cost: number; ordersCount: number }> = {};
    const timeMap: Record<string, { label: string; revenue: number; profit: number; cost: number; ordersCount: number }> = {};

    orders.forEach((order) => {
      rev += order.total;

      // Calculate cost per order items (using estimated 40% cost if not explicitly itemized)
      let orderCost = 0;
      order.items.forEach((item) => {
        const itemCost = item.price * 0.4 * item.quantity;
        orderCost += itemCost;

        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, quantity: 0, revenue: 0, cost: 0 };
        }
        itemMap[item.name].quantity += item.quantity;
        itemMap[item.name].revenue += item.subtotal;
        itemMap[item.name].cost += itemCost;
      });

      cost += orderCost;
      const orderProfit = Math.max(0, order.total - orderCost);

      // Payment Breakdown
      const pMethod = order.paymentMethod || 'cash';
      if (!paymentMap[pMethod]) {
        paymentMap[pMethod] = { count: 0, total: 0 };
      }
      paymentMap[pMethod].count += 1;
      paymentMap[pMethod].total += order.total;

      // Grouping by Date (YYYY-MM-DD)
      const dateKey = order.timestamp ? order.timestamp.slice(0, 10) : 'Today';
      if (!dayMap[dateKey]) {
        const d = new Date(order.timestamp);
        const dayLabel = !isNaN(d.getTime())
          ? d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
          : dateKey;
        dayMap[dateKey] = { label: dayLabel, revenue: 0, profit: 0, cost: 0, ordersCount: 0 };
      }
      dayMap[dateKey].revenue += order.total;
      dayMap[dateKey].profit += orderProfit;
      dayMap[dateKey].cost += orderCost;
      dayMap[dateKey].ordersCount += 1;

      // Grouping by Time / Hour (e.g. 10:00, 11:00 or Receipt #)
      const d = new Date(order.timestamp);
      const hourLabel = !isNaN(d.getTime())
        ? `${d.getHours().toString().padStart(2, '0')}:00`
        : order.receiptNumber.slice(-4);
      if (!timeMap[hourLabel]) {
        timeMap[hourLabel] = { label: hourLabel, revenue: 0, profit: 0, cost: 0, ordersCount: 0 };
      }
      timeMap[hourLabel].revenue += order.total;
      timeMap[hourLabel].profit += orderProfit;
      timeMap[hourLabel].cost += orderCost;
      timeMap[hourLabel].ordersCount += 1;
    });

    const profit = Math.max(0, rev - cost);
    const marginPct = rev > 0 ? (profit / rev) * 100 : 0;

    // Top 5 Products by Quantity
    const topProducts = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Payment Distribution Pie series
    const paymentSeriesData = [
      {
        id: 'promptpay',
        value: Math.round(paymentMap.promptpay.total),
        label: `${t.pos.paymentMethods.promptpay} (฿${Math.round(paymentMap.promptpay.total).toLocaleString()})`,
        color: '#3b82f6', // Bright Blue
      },
      {
        id: 'cash',
        value: Math.round(paymentMap.cash.total),
        label: `${t.pos.paymentMethods.cash} (฿${Math.round(paymentMap.cash.total).toLocaleString()})`,
        color: '#10b981', // Emerald
      },
      {
        id: 'credit_card',
        value: Math.round(paymentMap.credit_card.total),
        label: `${t.pos.paidCard} (฿${Math.round(paymentMap.credit_card.total).toLocaleString()})`,
        color: '#8b5cf6', // Violet
      },
    ].filter((item) => item.value > 0);

    // Trend Chart Data (Sorted chronologically)
    const activeMap = trendViewMode === 'day' ? dayMap : timeMap;
    const sortedTrendKeys = Object.keys(activeMap).sort();
    const trendData = sortedTrendKeys.map((k) => ({
      label: activeMap[k].label,
      revenue: Math.round(activeMap[k].revenue),
      profit: Math.round(activeMap[k].profit),
      cost: Math.round(activeMap[k].cost),
      ordersCount: activeMap[k].ordersCount,
    }));

    return {
      totalRevenue: rev,
      totalCost: cost,
      totalProfit: profit,
      profitMarginPercent: marginPct,
      topSellingProducts: topProducts,
      paymentMethodData: paymentSeriesData,
      trendChartData: trendData,
    };
  }, [orders, trendViewMode, t]);

  // Common MUI Chart Custom Theme Styling
  const chartCommonSx = {
    fontFamily: 'inherit',
    '& .MuiChartsAxis-tickLabel': {
      fill: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569',
      fontSize: 11,
      fontFamily: 'inherit',
    },
    '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': {
      stroke: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    '& .MuiChartsGrid-line': {
      stroke: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      strokeDasharray: '4 4',
    },
    '& .MuiChartsLegend-label': {
      fill: `${isDark ? 'rgba(255, 255, 255, 0.88)' : '#334155'} !important`,
      fontSize: '11px',
      fontWeight: 600,
      fontFamily: 'inherit',
    },
    '& .MuiChartsLegend-root': {
      paddingBottom: '4px',
    },
  };

  return (
    <PosCard className="p-5 sm:p-6 space-y-6 relative overflow-visible">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white liquid-gloss shadow-xs flex-shrink-0"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>{t.sales.chartsTitle}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary-light/80 dark:bg-primary-light/20 text-primary border border-primary-border">
                MUI Charts
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.sales.chartsSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Mode Toggle */}
          {isExpanded && (
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setTrendViewMode('time')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  trendViewMode === 'time'
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-2xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t.sales.chartViewModeTime}</span>
              </button>
              <button
                type="button"
                onClick={() => setTrendViewMode('day')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  trendViewMode === 'day'
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-2xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.sales.chartViewModeDay}</span>
              </button>
            </div>
          )}

          {/* Expand / Collapse Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
            title={isExpanded ? 'ย่อกราฟ' : 'ขยายกราฟ'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Revenue */}
        <div className="p-3.5 rounded-2xl liquid-glass-panel border flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary-text)' }}
          >
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
              {t.sales.chartRevenue}
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">
              ฿{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* KPI 2: Gross Profit */}
        <div className="p-3.5 rounded-2xl liquid-glass-panel border flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
              {t.sales.chartTotalProfit}
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ฿{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* KPI 3: Margin */}
        <div className="p-3.5 rounded-2xl liquid-glass-panel border flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Percent className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
              {t.sales.chartProfitMargin}
            </span>
            <span className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
              {profitMarginPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* KPI 4: Top Product */}
        <div className="p-3.5 rounded-2xl liquid-glass-panel border flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
              {t.sales.kpiBestSeller}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate block">
              {topSellingProducts[0]?.name || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Chart 1: Sales & Profit Trend (MUI BarChart - col-span-12 lg:col-span-8) */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl liquid-glass-panel border flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t.sales.chartSalesProfit}
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {trendViewMode === 'time' ? t.sales.chartViewModeTime : t.sales.chartViewModeDay}
              </span>
            </div>

            {trendChartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                {t.sales.chartNoData}
              </div>
            ) : (
              <div className="w-full h-[290px] -ml-2">
                <BarChart
                  dataset={trendChartData}
                  xAxis={[
                    {
                      scaleType: 'band',
                      dataKey: 'label',
                      tickLabelStyle: {
                        fill: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569',
                        fontSize: 10,
                        fontFamily: 'inherit',
                      },
                    },
                  ]}
                  yAxis={[
                    {
                      tickLabelStyle: {
                        fill: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569',
                        fontSize: 10,
                        fontFamily: 'inherit',
                      },
                      valueFormatter: (value: number | null) =>
                        value !== null ? `฿${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}` : '0',
                    },
                  ]}
                  series={[
                    {
                      dataKey: 'revenue',
                      label: t.sales.chartRevenue,
                      color: primaryColor,
                      valueFormatter: (v: number | null) => `฿${(v || 0).toLocaleString()}`,
                    },
                    {
                      dataKey: 'profit',
                      label: t.sales.chartProfit,
                      color: profitColor,
                      valueFormatter: (v: number | null) => `฿${(v || 0).toLocaleString()}`,
                    },
                    {
                      dataKey: 'cost',
                      label: t.sales.chartCost,
                      color: costColor,
                      valueFormatter: (v: number | null) => `฿${(v || 0).toLocaleString()}`,
                    },
                  ]}
                  borderRadius={6}
                  height={290}
                  margin={{ top: 25, bottom: 30, left: 55, right: 15 }}
                  grid={{ horizontal: true }}
                  slotProps={{
                    legend: {
                      direction: 'horizontal',
                      position: { vertical: 'top', horizontal: 'center' },
                    },
                    tooltip: {
                      container: () => document.body,
                      sx: { zIndex: 99999 },
                    },
                  }}
                  sx={chartCommonSx}
                />
              </div>
            )}
          </div>

          {/* Chart 2: Top 5 Best-Selling Products (MUI Horizontal BarChart - col-span-12 lg:col-span-5) */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl liquid-glass-panel border flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t.sales.chartTopSelling}
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.sales.chartUnitsSold}
              </span>
            </div>

            {topSellingProducts.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                {t.sales.chartNoData}
              </div>
            ) : (
              <div className="w-full h-[290px] -ml-2">
                <BarChart
                  layout="horizontal"
                  dataset={topSellingProducts.map((p) => ({
                    // Truncate name for yAxis label
                    shortName: p.name.length > 14 ? `${p.name.slice(0, 14)}…` : p.name,
                    fullName: p.name,
                    quantity: p.quantity,
                    revenue: p.revenue,
                  }))}
                  yAxis={[
                    {
                      scaleType: 'band',
                      dataKey: 'shortName',
                      tickLabelStyle: {
                        fill: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569',
                        fontSize: 10,
                        fontFamily: 'inherit',
                      },
                    },
                  ]}
                  xAxis={[
                    {
                      tickLabelStyle: {
                        fill: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569',
                        fontSize: 10,
                        fontFamily: 'inherit',
                      },
                      valueFormatter: (value: number | null) =>
                        value !== null ? `${value}` : '0',
                    },
                  ]}
                  series={[
                    {
                      dataKey: 'quantity',
                      label: t.sales.chartUnitsSold,
                      color: primaryColor,
                      valueFormatter: (v: number | null) => `${v || 0} ${t.common.items}`,
                    },
                  ]}
                  borderRadius={6}
                  height={290}
                  margin={{ top: 25, bottom: 30, left: 95, right: 20 }}
                  grid={{ vertical: true }}
                  slotProps={{
                    legend: {
                      direction: 'horizontal',
                      position: { vertical: 'top', horizontal: 'center' },
                    },
                    tooltip: {
                      container: () => document.body,
                      sx: { zIndex: 99999 },
                    },
                  }}
                  sx={chartCommonSx}
                />
              </div>
            )}
          </div>

          {/* Chart 3: Payment Method Distribution Donut (col-span-12) */}
          <div className="lg:col-span-12 p-4 sm:p-5 rounded-2xl liquid-glass-panel border flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1 max-w-sm w-full">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t.sales.chartPaymentMethod}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                สัดส่วนการชำระเงินของลูกค้าแยกตามช่องทางต่างๆ
              </p>

              {/* Payment Mini Pills */}
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-blue-700 dark:text-blue-300">
                    <QrCode className="w-3.5 h-3.5" /> PromptPay QR
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    ฿{Math.round(paymentMethodData.find((p) => p.id === 'promptpay')?.value || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
                    <Banknote className="w-3.5 h-3.5" /> {t.pos.paymentMethods.cash}
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    ฿{Math.round(paymentMethodData.find((p) => p.id === 'cash')?.value || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-purple-700 dark:text-purple-300">
                    <CreditCard className="w-3.5 h-3.5" /> {t.pos.paidCard}
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    ฿{Math.round(paymentMethodData.find((p) => p.id === 'credit_card')?.value || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="w-full lg:w-3/5 h-[240px] flex items-center justify-center">
              {paymentMethodData.length === 0 ? (
                <div className="text-xs text-slate-400">
                  {t.sales.chartNoData}
                </div>
              ) : (
                <PieChart
                  series={[
                    {
                      data: paymentMethodData,
                      innerRadius: 55,
                      outerRadius: 90,
                      paddingAngle: 3,
                      cornerRadius: 6,
                      highlightScope: { fade: 'global', highlight: 'item' },
                    },
                  ]}
                  height={240}
                  margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  slotProps={{
                    legend: {
                      direction: 'vertical',
                      position: { vertical: 'middle', horizontal: 'end' },
                    },
                    tooltip: {
                      container: () => document.body,
                      sx: { zIndex: 99999 },
                    },
                  }}
                  sx={chartCommonSx}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </PosCard>
  );
};
