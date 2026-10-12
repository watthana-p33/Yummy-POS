import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import type { Order } from '../types/pos';
import { PosCard, PosButton, PosInput, PosSelect, PosTable, type PosTableColumn } from './common';
import { MenuItem, Dialog } from '@mui/material';
import { SalesChartsSection } from './SalesChartsSection';
import {
  TrendingUp,
  FileText,
  DollarSign,
  Award,
  Search,
  Filter,
  CreditCard,
  Banknote,
  QrCode,
  Eye,
  Printer,
  X,
  RotateCcw,
} from 'lucide-react';

export const SalesHistoryScreen: React.FC = () => {
  const { orders, t } = usePos();

  // Advanced Filters State
  const [searchReceipt, setSearchReceipt] = useState('');
  const [selectedCashier, setSelectedCashier] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Order for Modal Detail
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Cashiers List from Orders
  const cashiersList = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => set.add(o.cashierName));
    return Array.from(set);
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Receipt number search
      if (
        searchReceipt &&
        !order.receiptNumber.toLowerCase().includes(searchReceipt.toLowerCase())
      ) {
        return false;
      }
      // Cashier filter
      if (selectedCashier !== 'all' && order.cashierName !== selectedCashier) {
        return false;
      }
      // Payment filter
      if (selectedPayment !== 'all' && order.paymentMethod !== selectedPayment) {
        return false;
      }
      // Date Range filter
      const orderDate = order.timestamp.slice(0, 10);
      if (startDate && orderDate < startDate) {
        return false;
      }
      if (endDate && orderDate > endDate) {
        return false;
      }

      return true;
    });
  }, [orders, searchReceipt, selectedCashier, selectedPayment, startDate, endDate]);

  // Metric KPI Computations
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + o.total, 0);
  }, [filteredOrders]);

  const totalBills = filteredOrders.length;

  const avgTicket = totalBills > 0 ? totalRevenue / totalBills : 0;

  // Best Selling Items
  const topSellingItems = useMemo(() => {
    const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemMap[item.name].quantity += item.quantity;
        itemMap[item.name].revenue += item.subtotal;
      });
    });

    return Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);
  }, [filteredOrders]);

  const handleResetFilters = () => {
    setSearchReceipt('');
    setSelectedCashier('all');
    setSelectedPayment('all');
    setStartDate('');
    setEndDate('');
  };

  const handlePrintModalReceipt = () => {
    window.print();
  };

  const orderColumns: PosTableColumn<Order>[] = [
    {
      id: 'receiptNumber',
      header: t.sales.tableHeaderReceipt,
      render: (order) => (
        <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
          {order.receiptNumber}
        </span>
      ),
    },
    {
      id: 'timestamp',
      header: t.sales.tableHeaderTime,
      render: (order) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {new Date(order.timestamp).toLocaleString('th-TH', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </span>
      ),
    },
    {
      id: 'cashierName',
      header: t.sales.tableHeaderCashier,
      render: (order) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {order.cashierName}
        </span>
      ),
    },
    {
      id: 'paymentMethod',
      header: t.sales.tableHeaderPayment,
      filterOptions: [
        { label: 'PromptPay QR', value: 'promptpay' },
        { label: t.pos.paidCash, value: 'cash' },
        { label: t.pos.paidCard, value: 'credit' },
      ],
      render: (order) => (
        order.paymentMethod === 'promptpay' ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <QrCode className="w-3.5 h-3.5" />
            PromptPay QR
          </span>
        ) : order.paymentMethod === 'cash' ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Banknote className="w-3.5 h-3.5" />
            {t.pos.paidCash}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
            <CreditCard className="w-3.5 h-3.5" />
            {t.pos.paidCard}
          </span>
        )
      ),
    },
    {
      id: 'items',
      header: t.sales.quantityColumn,
      align: 'center',
      sortKey: (order: Order) => order.items.reduce((s, i) => s + i.quantity, 0),
      render: (order) => (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {order.items.reduce((s, i) => s + i.quantity, 0)}
        </span>
      ),
    },
    {
      id: 'total',
      header: t.sales.tableHeaderTotal,
      align: 'right',
      render: (order) => (
        <span
          className="font-mono font-bold text-sm"
          style={{ color: 'var(--theme-primary)' }}
        >
          ฿{order.total.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t.sales.tableHeaderActions,
      align: 'center',
      render: (order) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(order);
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 border"
          style={{
            backgroundColor: 'var(--theme-primary-light)',
            color: 'var(--theme-primary-text)',
            borderColor: 'var(--theme-primary-border)',
          }}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t.sales.viewBill}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Banner */}
      <PosCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.sales.title}</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {t.sales.subtitle}
            </p>
          </div>
        </div>
      </PosCard>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <PosCard hoverable className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.sales.kpiTotalRevenue}</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              ฿{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>{t.sales.filteredOrdersNote}</span>
            </div>
          </div>
        </PosCard>

        {/* Card 2: Total Bills */}
        <PosCard hoverable className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.sales.kpiTotalBills}</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {totalBills} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.common.orders}</span>
            </div>
            <div className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
              {t.sales.completedBillsNote}
            </div>
          </div>
        </PosCard>

        {/* Card 3: Average Ticket */}
        <PosCard hoverable className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.sales.kpiAvgBill}</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              ฿{avgTicket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              {t.sales.avgTicketNote}
            </div>
          </div>
        </PosCard>

        {/* Card 4: Top Seller Preview */}
        <PosCard hoverable className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.sales.kpiBestSeller}</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
              {topSellingItems[0]?.name || '-'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              {topSellingItems[0] ? `${t.sales.soldItemsCount} ${topSellingItems[0].quantity} ${t.common.items}` : t.sales.noData}
            </div>
          </div>
        </PosCard>
      </div>

      {/* Top 4 Best Selling Badges */}
      {topSellingItems.length > 0 && (
        <div className="liquid-glass-card p-4 rounded-2xl border flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mr-2">
            <Award className="w-4 h-4 text-[#5b8a72]" />
            {t.sales.topSellingHeader}
          </span>
          {topSellingItems.map((item, idx) => (
            <div
              key={idx}
              className="liquid-glass-panel px-3 py-1.5 rounded-xl border text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-sm"
            >
              <span
                className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold liquid-gloss"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                {idx + 1}
              </span>
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{item.name}</span>
              <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>({item.quantity} {t.common.items})</span>
            </div>
          ))}
        </div>
      )}

      {/* Visual Analytics Charts Section (Sales, Profit & Best Sellers) */}
      <SalesChartsSection orders={filteredOrders} />

      {/* Advanced Filter Section */}
      <PosCard className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <Filter className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
            <span>{t.sales.advancedFilters}</span>
          </div>
          {(searchReceipt ||
            selectedCashier !== 'all' ||
            selectedPayment !== 'all' ||
            startDate ||
            endDate) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold flex items-center gap-1 cursor-pointer hover:opacity-80 transition"
              style={{ color: 'var(--theme-primary)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.common.clearFilters}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          {/* Search Receipt */}
          <div>
            <PosInput
              placeholder={t.sales.filterReceiptPlaceholder}
              value={searchReceipt}
              onChange={(e) => setSearchReceipt(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />,
                },
              }}
            />
          </div>

          {/* Cashier Select */}
          <div>
            <PosSelect
              value={selectedCashier}
              onChange={(e) => setSelectedCashier(e.target.value as string)}
            >
              <MenuItem value="all">{t.sales.filterCashierAll}</MenuItem>
              {cashiersList.map((cashier) => (
                <MenuItem key={cashier} value={cashier}>
                  {cashier}
                </MenuItem>
              ))}
            </PosSelect>
          </div>

          {/* Payment Method Select */}
          <div>
            <PosSelect
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value as string)}
            >
              <MenuItem value="all">{t.sales.filterPaymentAll}</MenuItem>
              <MenuItem value="promptpay">{t.sales.filterPromptPay}</MenuItem>
              <MenuItem value="cash">{t.sales.filterCash}</MenuItem>
              <MenuItem value="credit_card">{t.sales.filterCard}</MenuItem>
            </PosSelect>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1">
              <PosInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <span className="text-xs text-slate-500 font-bold">-</span>
            <div className="flex-1">
              <PosInput
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </PosCard>

      {/* MOBILE ORDERS LIST (< md) */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <PosCard className="p-8 text-center text-slate-400">
            {t.sales.noSalesFound}
          </PosCard>
        ) : (
          filteredOrders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <PosCard
                key={order.id}
                hoverable
                onClick={() => setSelectedOrder(order)}
                className="p-4 space-y-2.5 active:scale-[0.99] transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                    {order.receiptNumber}
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    {new Date(order.timestamp).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">{t.pos.cashier}: {order.cashierName}</span>
                  {order.paymentMethod === 'promptpay' ? (
                    <span className="inline-flex items-center gap-1 font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg text-[11px]">
                      <QrCode className="w-3.5 h-3.5" /> PromptPay QR
                    </span>
                  ) : order.paymentMethod === 'cash' ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg text-[11px]">
                      <Banknote className="w-3.5 h-3.5" /> {t.pos.paidCash}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-lg text-[11px]">
                      <CreditCard className="w-3.5 h-3.5" /> {t.pos.paidCard}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{itemCount} {t.common.items}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-sm"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      ฿{order.total.toLocaleString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      className="px-2.5 py-1 font-bold rounded-lg text-xs hover:opacity-80 transition cursor-pointer"
                      style={{
                        backgroundColor: 'var(--theme-primary-light)',
                        color: 'var(--theme-primary-text)',
                      }}
                    >
                      {t.sales.viewBill}
                    </button>
                  </div>
                </div>
              </PosCard>
            );
          })
        )}
      </div>

      {/* DESKTOP / TABLET ORDERS TABLE (>= md) */}
      <div className="hidden md:block">
        <PosTable
          columns={orderColumns}
          data={filteredOrders}
          keyExtractor={(order) => order.id}
          onRowClick={(order) => setSelectedOrder(order)}
          emptyMessage={t.sales.noSalesFound}
          variant="panel"
          minWidth={700}
        />
      </div>

      {/* MODAL: Order Detail & Reprint Receipt */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(5, 7, 12, 0.65)',
            },
          },
          paper: {
            elevation: 0,
            sx: {
              borderRadius: '28px',
              overflow: 'hidden',
              backgroundColor: 'transparent',
            },
          },
        }}
      >
        {selectedOrder && (
          <div className="liquid-glass-card rounded-[28px] w-full overflow-hidden shadow-2xl border text-slate-800 dark:text-slate-100">
            {/* Modal Header */}
            <div className="p-4 bg-white/40 dark:bg-white/5 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white liquid-gloss shadow-xs"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm">{t.sales.billDetailsTitle} {selectedOrder.receiptNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Info */}
            <div className="p-6 font-mono text-xs">
              <div className="pb-3 border-b border-dashed border-slate-200 dark:border-white/15 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{selectedOrder.receiptNumber}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(selectedOrder.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--theme-primary-light)',
                    color: 'var(--theme-primary-text)',
                    borderColor: 'var(--theme-primary-border)',
                  }}
                >
                  {t.pos.cashier}: {selectedOrder.cashierName}
                </span>
              </div>

              {/* Items List */}
              <div className="py-4 border-b border-dashed border-slate-200 dark:border-white/15 space-y-2 max-h-60 overflow-y-auto">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.quantity} × ฿{item.price}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ฿{item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{t.pos.subtotal}</span>
                  <span>฿{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>{t.pos.discount}</span>
                    <span>-฿{selectedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{t.pos.vat}</span>
                  <span>฿{selectedOrder.taxAmount.toLocaleString()}</span>
                </div>
                <div
                  className="flex justify-between text-base font-bold pt-2 border-t border-slate-200 dark:border-white/15"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  <span>{t.pos.netTotal}</span>
                  <span>฿{selectedOrder.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>{t.pos.paymentChannel}:</span>
                  <span className="font-bold uppercase">
                    {selectedOrder.paymentMethod === 'promptpay'
                      ? t.pos.paidPromptPay
                      : selectedOrder.paymentMethod === 'cash'
                      ? t.pos.paidCash
                      : t.pos.paidCard}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white/30 dark:bg-white/5 border-t border-black/5 dark:border-white/10 flex gap-2">
              <PosButton
                variantStyle="outline"
                onClick={handlePrintModalReceipt}
                startIcon={<Printer className="w-4 h-4" />}
                className="flex-1"
              >
                {t.sales.reprintReceipt}
              </PosButton>
              <PosButton
                variantStyle="secondary"
                onClick={() => setSelectedOrder(null)}
                className="flex-1"
              >
                {t.sales.closeWindow}
              </PosButton>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
