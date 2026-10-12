import React, { useState, useEffect } from 'react';
import { usePos } from '../../context/PosContext';
import type { PaymentMethod, Product } from '../../types/pos';
import { PosInput, PosSelect, ShiftModal, CustomerSearchDialog } from '../common';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  QrCode,
  Banknote,
  Receipt,
  Percent,
  CheckCircle2,
  Printer,
  X,
  CreditCard,
  AlertCircle,
  User,
  UserPlus,
  Lock,
  Unlock,
  Clock,
  CircleDollarSign,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PosScreen: React.FC = () => {
  const {
    currentUser,
    products,
    cart,
    addToCart,
    updateCartQuantity,
    clearCart,
    discount,
    discountType,
    setDiscount,
    subtotal,
    calculatedDiscount,
    taxAmount,
    total,
    createOrder,
    currentReceipt,
    setCurrentReceipt,
    selectedCustomer,
    setSelectedCustomer,
    addCustomer,
    currentShift,
    categories,
    themeMode,
    t,
  } = usePos();

  const isDark = themeMode === 'dark';
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [time, setTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promptpay');

  // Shift Modal State (Open / Close shift from POS screen)
  const [shiftModalMode, setShiftModalMode] = useState<'open' | 'close' | null>(null);

  // Unit Selector Modal State (when clicking product with packaging units)
  const [unitSelectProduct, setUnitSelectProduct] = useState<Product | null>(null);

  // Quick Customer Modal
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState<boolean>(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustPhone, setNewCustPhone] = useState<string>('');

  const [cashReceived, setCashReceived] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<string>(discount > 0 ? String(discount) : '');
  const [isDiscountPercent, setIsDiscountPercent] = useState<boolean>(discountType === 'percent');

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery)) ||
      (p.units && p.units.some((u) => u.barcode && u.barcode.includes(searchQuery)));
    return matchesCategory && matchesSearch;
  });

  // Handle Quick Add Discount
  const handleApplyDiscount = () => {
    const val = parseFloat(discountInput) || 0;
    setDiscount(val, isDiscountPercent ? 'percent' : 'fixed');
  };

  // Open Checkout
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    if (!currentShift) {
      setShiftModalMode('open');
      return;
    }
    setCashReceived(String(Math.ceil(total)));
    setShowCheckoutModal(true);
  };

  // Confirm Payment
  const handleConfirmPayment = () => {
    const receivedNum = paymentMethod === 'cash' ? parseFloat(cashReceived) || total : total;
    if (paymentMethod === 'cash' && receivedNum < total) {
      alert(t.pos.cashNotEnoughAlert);
      return;
    }

    const order = createOrder(paymentMethod, receivedNum);
    if (order) {
      setShowCheckoutModal(false);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // fallback if confetti not loaded
      }
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const numericCashReceived = parseFloat(cashReceived) || 0;
  const cashChange = Math.max(0, numericCashReceived - total);

  // If shift is closed, show ONLY the waiting screen (hide top shift bar, products, and cart panel)
  if (!currentShift) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center overflow-y-auto">
        <div className="max-w-md w-full liquid-glass-card rounded-[36px] p-8 sm:p-12 flex flex-col items-center shadow-2xl border border-white/60 dark:border-white/10 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Decorative Glow */}
          <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

          {/* Status Badge Icon */}
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-5 relative shadow-inner">
            <Lock className="w-9 h-9" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
            </span>
          </div>

          {/* Headings */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
            {t.pos?.waitingShiftTitle || 'รอเปิดกะการขาย'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed max-w-sm">
            {t.pos?.waitingShiftDesc || 'กรุณาเปิดกะการขายเพื่อเริ่มต้นแสดงรายการสินค้าและรับออร์เดอร์'}
          </p>

          {/* Info Pill */}
          <div className="w-full p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] mb-6 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {currentUser?.name || t.staff.roleCashier}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{time.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            data-testid="pos-open-shift-hero-btn"
            onClick={() => setShiftModalMode('open')}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-primary to-[var(--theme-primary-hover)] text-white shadow-[0_8px_24px_-4px_var(--theme-primary-border),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Unlock className="w-5 h-5" />
            <span>{t.staff.openShiftBtn}</span>
          </button>
        </div>

        {/* Shift Management Modal */}
        <ShiftModal
          isOpen={shiftModalMode !== null}
          mode={shiftModalMode || 'open'}
          onClose={() => setShiftModalMode(null)}
        />
      </div>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, height: '100%', maxHeight: '100%', overflow: 'hidden', bgcolor: 'transparent' }}>
      {/* CENTER / MAIN: Products Catalog & Filter (Scrollable Viewport) */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, overflow: 'hidden', pl: { xs: 1, sm: 2, lg: 2.5 }, pr: { xs: 1, sm: 2 } }}>
        {/* Search & Category Filter Sticky Bar */}
        <div className="rounded-3xl p-4.5 liquid-glass-panel mb-4 space-y-3.5 flex-shrink-0 transition-colors">
          {/* Shift Status & Quick Action Bar directly on POS screen */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
            <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
              {/* Clock & Real-time Indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-white/[0.06] border border-white/60 dark:border-white/[0.1] backdrop-blur-md flex-shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="whitespace-nowrap">{time.toLocaleTimeString()}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-light/80 text-primary-text border border-primary-border/80 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-primary -ml-3.5" />
                  <span className="font-bold">{t.sidebar.activeShift}</span>
                </span>
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{currentShift.cashierName}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>{t.pos.startingCash}: ฿{currentShift.startingCash.toLocaleString()}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="font-semibold text-primary-text">
                    {t.pos.salesLabel}: ฿{currentShift.totalSales.toLocaleString()} ({currentShift.totalOrders} {t.common.orders})
                  </span>
                </div>
              </div>
            </div>

            {/* Shift Action Button */}
            <div>
              <button
                type="button"
                data-testid="pos-close-shift-btn"
                onClick={() => setShiftModalMode('close')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#faebe7] hover:bg-[#e58a74] text-[#c8634c] hover:text-white dark:bg-[#3b2420] dark:text-[#f4a28c] dark:hover:text-white border border-[#f4c7be] dark:border-[rgba(255,255,255,0.08)] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t.staff.closeShiftBtn}</span>
              </button>
            </div>
          </div>

          {/* Search bar & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search bar */}
            <div className="flex-1 relative min-w-0">
              <PosInput
                placeholder={t.pos.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />,
                  },
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-lg z-10 cursor-pointer ${
                    isDark ? 'bg-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.common.cancel}
                </button>
              )}
            </div>

            {/* Categories Searchable Select */}
            <div className="w-full sm:w-60 md:w-64 flex-shrink-0">
              <PosSelect
                searchable
                searchPlaceholder="ค้นหาหมวดหมู่..."
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as string)}
              >
                {categories.map((cat) => {
                  const rawLabel =
                    (t.pos.categories as Record<string, string>)[cat.id] ||
                    (t.pos.categories as Record<string, string>)[cat.id.replace(/s$/, '')] ||
                    cat.name;
                  const catLabel = rawLabel.includes(cat.icon)
                    ? rawLabel
                    : `${cat.icon} ${rawLabel}`;
                  return (
                    <MenuItem key={cat.id} value={cat.id}>
                      {catLabel}
                    </MenuItem>
                  );
                })}
              </PosSelect>
            </div>
          </div>
        </div>

        {/* Product Grid (Independent Scroll Container) */}
        <div className="flex-1 overflow-y-auto pr-1 pb-20 lg:pb-4">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
              <AlertCircle className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">{t.pos.noProductsSearch}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.pos.tryDifferentSearch}</p>
            </div>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  xl: 'repeat(4, 1fr)',
                  '2xl': 'repeat(5, 1fr)',
                },
                gap: { xs: 1.5, sm: 2 },
                pb: 4,
              }}
            >
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock < 10;
                const cartLines = cart.filter((item) => item.product.id === product.id);
                const totalInCartQty = cartLines.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (isOutOfStock) return;
                      if (product.units && product.units.length > 0) {
                        setUnitSelectProduct(product);
                      } else {
                        addToCart(product);
                      }
                    }}
                    className={`group rounded-3xl transition-all duration-300 overflow-hidden flex flex-col relative select-none liquid-glass-card hover:-translate-y-1.5 active:scale-[0.98] cursor-pointer ${
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed grayscale'
                        : 'hover:border-primary/60 hover:shadow-[0_16px_36px_-6px_var(--theme-primary-border,rgba(0,0,0,0.3))]'
                    }`}
                  >
                    {/* Badge In-cart count */}
                    {totalInCartQty > 0 && (
                      <div className="!absolute top-2.5 right-2.5 z-20 bg-gradient-to-br from-primary to-[var(--theme-primary-hover)] text-white text-xs font-bold min-w-6 h-6 px-1.5 rounded-full flex items-center justify-center shadow-[0_2px_8px_var(--theme-primary-border),inset_0_1px_1px_rgba(255,255,255,0.7)] pointer-events-none liquid-gloss">
                        {totalInCartQty}
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="w-full h-32 sm:h-36 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                          {t?.pos?.outOfStock || t?.stockBadge?.outOfStockLabel || 'สินค้าหมด'}
                        </div>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <span className="absolute bottom-2 left-2 bg-[#e5a855] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-2xs">
                          ⚡ {t?.pos?.lowStock || t?.stockBadge?.lowStockLabel || 'เหลือ'} {product.stock}
                        </span>
                      )}
                    </div>

                    {/* Product Content */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className={`font-semibold text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#5b8a72] dark:group-hover:text-[#7eb99d] transition-colors ${
                          isDark ? 'text-slate-100' : 'text-slate-900'
                        }`}>
                          {product.name}
                        </h3>
                        {product.barcode && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tight mt-0.5 block">
                            #{product.barcode}
                          </span>
                        )}
                        {product.units && product.units.length > 0 && (
                          <div className="mt-1 flex items-center gap-1">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary-light text-primary-text border border-primary-border/40 inline-flex items-center gap-1">
                              <Package className="w-3 h-3 text-primary" />
                              <span>มีหน่วยแพ็ค/ลัง</span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#ebe7df] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between">
                        <div>
                          <span className="text-base sm:text-lg font-bold text-primary-text tracking-tight">
                            ฿{product.price.toLocaleString()}
                          </span>
                          {product.baseUnit && (
                            <span className="text-[11px] text-slate-400 font-sans ml-0.5">
                              /{product.baseUnit}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            product.stock > 10
                              ? isDark ? 'text-slate-300 bg-slate-800' : 'text-slate-600 bg-slate-100'
                              : product.stock > 0
                              ? 'text-amber-800 bg-amber-100/80 dark:text-amber-300 dark:bg-amber-950/60'
                              : 'text-rose-800 bg-rose-100/80 dark:text-rose-300 dark:bg-rose-950/60'
                          }`}
                        >
                          {product.stock > 10
                            ? `${t?.pos?.stockInHand || t?.stockBadge?.inStockLabel || 'คลัง'} ${product.stock} ${product.baseUnit || ''}`
                            : `${t?.pos?.lowStock || t?.stockBadge?.lowStockLabel || 'เหลือ'} ${product.stock} ${product.baseUnit || ''}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Box>
          )}
        </div>
      </Box>

      {/* MOBILE STICKY FLOATING CART BAR (MUI Responsive: visible on < lg) */}
      <Box
        sx={{
          display: { xs: 'flex', lg: 'none' },
          position: 'fixed',
          bottom: 12,
          left: 12,
          right: 12,
          p: 1.5,
          borderRadius: '20px',
          backdropFilter: 'blur(16px)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          boxShadow: isDark ? '0 16px 36px rgba(0,0,0,0.6)' : '0 16px 36px rgba(0,0,0,0.12)',
          bgcolor: isDark ? 'rgba(21, 25, 34, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          zIndex: 35,
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className={`flex-1 flex items-center gap-2.5 p-2 rounded-xl transition text-left cursor-pointer ${
            isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm relative">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#e58a74] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-slate-900">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <div>
            <div className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              {cart.length > 0 ? `${cart.reduce((s, i) => s + i.quantity, 0)} ${t.pos.cartItems}` : t.pos.emptyCart}
            </div>
            <div className="text-xs font-bold text-primary-text">
              ฿{total.toLocaleString()}
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            if (!currentShift) {
              setShiftModalMode('open');
              return;
            }
            handleOpenCheckout();
          }}
          disabled={cart.length === 0 || !currentShift}
          className="py-3 px-5 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition cursor-pointer"
        >
          {!currentShift ? <Lock className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
          <span>{!currentShift ? (t.pos?.waitingShiftTitle || 'รอเปิดกะการขาย') : t.pos.payBtn}</span>
        </button>
      </Box>

      {/* MOBILE CART DRAWER (MUI Responsive: visible on < lg) */}
      <Drawer
        anchor="right"
        open={isMobileCartOpen}
        onClose={() => setIsMobileCartOpen(false)}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100%',
            height: '100%',
            bgcolor: isDark ? '#111422' : '#ffffff',
            backgroundImage: 'none',
            p: 0,
            overflow: 'hidden',
          },
        }}
      >
        <div className="flex flex-col h-full overflow-hidden select-none">
          {/* Cart Header (Pinned Top) */}
          <div className="p-4 border-b border-[#ebe7df]/70 dark:border-white/[0.06] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-light text-primary-text flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm leading-tight">{t.pos.cartTitle}</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {cart.reduce((s, i) => s + i.quantity, 0)} {t.pos.cartItemsInCart}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.pos.clearCart}</span>
                </button>
              )}
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Customer Select Bar */}
          <div className="px-4 py-2 border-b border-[#ebe7df]/70 dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.015] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <User className="w-4 h-4 text-[#5b8a72] flex-shrink-0" />
              <button
                type="button"
                onClick={() => setShowCustomerSearchModal(true)}
                className={`flex-1 min-w-0 flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                  selectedCustomer
                    ? 'bg-primary/10 border-primary/30 text-primary-text font-semibold hover:bg-primary/15'
                    : 'bg-white/70 dark:bg-white/[0.04] border-[#ebe7df] dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-primary/40'
                }`}
                title="คลิกเพื่อค้นหาและเลือกลูกค้า"
              >
                <span className="truncate">
                  {selectedCustomer ? selectedCustomer.name : `👤 ${t.customers.walkInCustomer}`}
                </span>
                <Search className="w-3.5 h-3.5 opacity-60 flex-shrink-0 ml-1" />
              </button>
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  title="ยกเลิกการเลือกลูกค้า (กลับสู่ลูกค้าทั่วไป)"
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAddCustomerModal(true)}
              title={t.pos.newCustomerTooltip}
              className="p-1.5 rounded-xl border border-[#ebe7df] dark:border-white/[0.1] hover:bg-[#e8f3ee] text-[#5b8a72] transition cursor-pointer flex-shrink-0 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
            {selectedCustomer && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-light text-primary-text flex-shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                +{Math.floor(total / 10)} {t.common.points}
              </span>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-6 text-center">
                <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2 stroke-1" />
                <p className="text-sm font-semibold">{t.pos.emptyCartTitle}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t.pos.emptyCartDesc}</p>
              </div>
            ) : (
              cart.map((item) => {
                const lineId =
                  item.id ||
                  (item.selectedUnit
                    ? `${item.product.id}-${item.selectedUnit.id}`
                    : `${item.product.id}-base`);
                const unitPrice = item.selectedUnit ? item.selectedUnit.price : item.product.price;
                const unitMult = item.selectedUnit ? item.selectedUnit.multiplier : 1;
                const otherLinesStockUsed = cart
                  .filter((other) => other.product.id === item.product.id && other !== item)
                  .reduce((sum, other) => sum + other.quantity * (other.selectedUnit?.multiplier || 1), 0);
                const maxAllowed = Math.floor((item.product.stock - otherLinesStockUsed) / unitMult);
                const isMaxReached = item.quantity >= maxAllowed;

                return (
                  <div
                    key={lineId}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                      isDark
                        ? 'bg-[#181f2c]/75 border-white/[0.05] hover:border-white/15'
                        : 'bg-white/85 border-[#ebe7df]/80 hover:border-primary/30 shadow-[0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.9)]'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                          {item.product.name}
                        </h4>
                        {item.selectedUnit ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 whitespace-nowrap">
                            {item.selectedUnit.name}
                          </span>
                        ) : (
                          item.product.baseUnit && item.product.baseUnit !== 'ชิ้น' && (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                              {item.product.baseUnit}
                            </span>
                          )
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        ฿{unitPrice.toLocaleString()} × {item.quantity} ={' '}
                        <span className="font-bold text-primary-text">
                          ฿{(unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 border rounded-xl p-0.5 shadow-2xs backdrop-blur-md ${
                      isDark
                        ? 'bg-[#151922]/90 border-white/[0.08]'
                        : 'bg-white border-[#ebe7df]/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]'
                    }`}>
                      <button
                        onClick={() => updateCartQuantity(lineId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(lineId, item.quantity + 1)}
                        disabled={isMaxReached}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary-light disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing breakdown & checkout */}
          <div className={`p-4 border-t space-y-3 flex-shrink-0 backdrop-blur-xl ${
            isDark
              ? 'bg-[#11141c]/90 border-white/[0.06]'
              : 'bg-[#f8f7f4]/90 border-[#ebe7df]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]'
          }`}>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <PosInput
                  type="number"
                  placeholder={isDiscountPercent ? t.pos.discountPercentPlaceholder : t.pos.discountBahtPlaceholder}
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  onBlur={handleApplyDiscount}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setDiscountInput('');
                  setDiscount(0);
                }}
                disabled={discount === 0 && !discountInput}
                title={t.pos.clearDiscount}
                className={`p-3 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 ${
                  discount > 0 || discountInput
                    ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 cursor-pointer'
                    : 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border border-transparent'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextPercent = !isDiscountPercent;
                  setIsDiscountPercent(nextPercent);
                  const val = parseFloat(discountInput) || 0;
                  setDiscount(val, nextPercent ? 'percent' : 'fixed');
                }}
                title={isDiscountPercent ? '%' : t.common.baht}
                className={`w-[48px] h-[48px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 cursor-pointer ${
                  isDiscountPercent
                    ? 'bg-primary text-white shadow-sm hover:brightness-105'
                    : isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                    : 'bg-primary text-white shadow-sm hover:brightness-105'
                }`}
              >
                {isDiscountPercent ? <Percent className="w-5 h-5" /> : <CircleDollarSign className="w-5 h-5" />}
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>{t.pos.subtotal}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  ฿{subtotal.toLocaleString()}
                </span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-primary-text font-medium">
                  <span>
                    {t.pos.discount} {discountType === 'percent' ? `(${discount}%)` : ''}
                  </span>
                  <span className="font-semibold">-฿{calculatedDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.pos.tax}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  ฿{taxAmount.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-[#ebe7df] dark:border-[rgba(255,255,255,0.08)] flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t.pos.total}
                </span>
                <span className="text-xl font-bold text-primary-text">
                  ฿{total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsMobileCartOpen(false);
                handleOpenCheckout();
              }}
              disabled={cart.length === 0}
              className="w-full py-3.5 px-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] bg-gradient-to-r from-primary to-[var(--theme-primary-hover)] hover:opacity-95 disabled:opacity-40 disabled:pointer-events-none text-white shadow-[0_8px_24px_-4px_var(--theme-primary-border),inset_0_1px_1px_rgba(255,255,255,0.5)] ring-1 ring-white/20"
            >
              <Banknote className="w-5 h-5" />
              <span>{t.pos.checkoutBtn} (฿{total.toLocaleString()})</span>
            </button>
          </div>
        </div>
      </Drawer>

      {/* DESKTOP PERMANENT CART PANEL (MUI Responsive: visible on >= lg) */}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', lg: 'flex' },
          width: { lg: 380, xl: 400 },
          flexShrink: 0,
          height: '100%',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        className="liquid-glass-panel border-l border-white/30 dark:border-white/10 select-none"
      >
        <div className="flex flex-col h-full overflow-hidden select-none">
          {/* Cart Header (Pinned Top) */}
          <div className="p-4 border-b border-[#ebe7df]/70 dark:border-white/[0.06] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-light text-primary-text flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm leading-tight">{t.pos.cartTitle}</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {cart.reduce((s, i) => s + i.quantity, 0)} {t.pos.cartItemsInCart}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.pos.clearCart}</span>
                </button>
              )}
            </div>
          </div>

          {/* Customer Select Bar */}
          <div className="px-4 py-2 border-b border-[#ebe7df]/70 dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.015] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <User className="w-4 h-4 text-[#5b8a72] flex-shrink-0" />
              <button
                type="button"
                onClick={() => setShowCustomerSearchModal(true)}
                className={`flex-1 min-w-0 flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                  selectedCustomer
                    ? 'bg-primary/10 border-primary/30 text-primary-text font-semibold hover:bg-primary/15'
                    : 'bg-white/70 dark:bg-white/[0.04] border-[#ebe7df] dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-primary/40'
                }`}
                title="คลิกเพื่อค้นหาและเลือกลูกค้า"
              >
                <span className="truncate">
                  {selectedCustomer ? selectedCustomer.name : `👤 ${t.customers.walkInCustomer}`}
                </span>
                <Search className="w-3.5 h-3.5 opacity-60 flex-shrink-0 ml-1" />
              </button>
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  title="ยกเลิกการเลือกลูกค้า (กลับสู่ลูกค้าทั่วไป)"
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAddCustomerModal(true)}
              title={t.pos.newCustomerTooltip}
              className="p-1.5 rounded-xl border border-[#ebe7df] dark:border-white/[0.1] hover:bg-[#e8f3ee] text-[#5b8a72] transition cursor-pointer flex-shrink-0 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
            {selectedCustomer && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-light text-primary-text flex-shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                +{Math.floor(total / 10)} {t.common.points}
              </span>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-6 text-center">
                <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2 stroke-1" />
                <p className="text-sm font-semibold">{t.pos.emptyCartTitle}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t.pos.emptyCartDesc}</p>
              </div>
            ) : (
              cart.map((item) => {
                const lineId =
                  item.id ||
                  (item.selectedUnit
                    ? `${item.product.id}-${item.selectedUnit.id}`
                    : `${item.product.id}-base`);
                const unitPrice = item.selectedUnit ? item.selectedUnit.price : item.product.price;
                const unitMult = item.selectedUnit ? item.selectedUnit.multiplier : 1;
                const otherLinesStockUsed = cart
                  .filter((other) => other.product.id === item.product.id && other !== item)
                  .reduce((sum, other) => sum + other.quantity * (other.selectedUnit?.multiplier || 1), 0);
                const maxAllowed = Math.floor((item.product.stock - otherLinesStockUsed) / unitMult);
                const isMaxReached = item.quantity >= maxAllowed;

                return (
                  <div
                    key={lineId}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                      isDark
                        ? 'bg-[#181f2c]/75 border-white/[0.05] hover:border-white/15'
                        : 'bg-white/85 border-[#ebe7df]/80 hover:border-primary/30 shadow-[0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.9)]'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                          {item.product.name}
                        </h4>
                        {item.selectedUnit ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 whitespace-nowrap">
                            {item.selectedUnit.name}
                          </span>
                        ) : (
                          item.product.baseUnit && item.product.baseUnit !== 'ชิ้น' && (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                              {item.product.baseUnit}
                            </span>
                          )
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        ฿{unitPrice.toLocaleString()} × {item.quantity} ={' '}
                        <span className="font-bold text-primary-text">
                          ฿{(unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 border rounded-xl p-0.5 shadow-2xs backdrop-blur-md ${
                      isDark
                        ? 'bg-[#151922]/90 border-white/[0.08]'
                        : 'bg-white border-[#ebe7df]/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]'
                    }`}>
                      <button
                        onClick={() => updateCartQuantity(lineId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(lineId, item.quantity + 1)}
                        disabled={isMaxReached}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary-light disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing breakdown & checkout */}
          <div className={`p-4 border-t space-y-3 flex-shrink-0 backdrop-blur-xl ${
            isDark
              ? 'bg-[#11141c]/90 border-white/[0.06]'
              : 'bg-[#f8f7f4]/90 border-[#ebe7df]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]'
          }`}>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <PosInput
                  type="number"
                  placeholder={isDiscountPercent ? t.pos.discountPercentPlaceholder : t.pos.discountBahtPlaceholder}
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  onBlur={handleApplyDiscount}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setDiscountInput('');
                  setDiscount(0);
                }}
                disabled={discount === 0 && !discountInput}
                title={t.pos.clearDiscount}
                className={`p-3 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 ${
                  discount > 0 || discountInput
                    ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 cursor-pointer'
                    : 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border border-transparent'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextPercent = !isDiscountPercent;
                  setIsDiscountPercent(nextPercent);
                  const val = parseFloat(discountInput) || 0;
                  setDiscount(val, nextPercent ? 'percent' : 'fixed');
                }}
                title={isDiscountPercent ? '%' : t.common.baht}
                className={`w-[48px] h-[48px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 cursor-pointer ${
                  isDiscountPercent
                    ? 'bg-primary text-white shadow-sm hover:brightness-105'
                    : isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                    : 'bg-primary text-white shadow-sm hover:brightness-105'
                }`}
              >
                {isDiscountPercent ? <Percent className="w-5 h-5" /> : <CircleDollarSign className="w-5 h-5" />}
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>{t.pos.subtotal}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  ฿{subtotal.toLocaleString()}
                </span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-primary-text font-medium">
                  <span>
                    {t.pos.discount} {discountType === 'percent' ? `(${discount}%)` : ''}
                  </span>
                  <span className="font-semibold">-฿{calculatedDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.pos.tax}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  ฿{taxAmount.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-[#ebe7df] dark:border-[rgba(255,255,255,0.08)] flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t.pos.total}
                </span>
                <span className="text-xl font-bold text-primary-text">
                  ฿{total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                handleOpenCheckout();
              }}
              disabled={cart.length === 0}
              className="w-full py-3.5 px-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] bg-gradient-to-r from-primary to-[var(--theme-primary-hover)] hover:opacity-95 disabled:opacity-40 disabled:pointer-events-none text-white shadow-[0_8px_24px_-4px_var(--theme-primary-border),inset_0_1px_1px_rgba(255,255,255,0.5)] ring-1 ring-white/20"
            >
              <Banknote className="w-5 h-5" />
              <span>{t.pos.checkoutBtn} (฿{total.toLocaleString()})</span>
            </button>
          </div>
        </div>
      </Box>

      {/* MODAL: Checkout / Payment */}
      <Dialog
        open={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobileScreen}
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
        <div className="liquid-glass-card rounded-[28px] w-full overflow-hidden shadow-2xl border text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-[var(--theme-primary-hover)] text-white p-5 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-white/90" />
                <h3 className="font-bold text-base">{t.pos.checkoutModalTitle}</h3>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-xl transition cursor-pointer active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Total Due */}
              <div className="text-center bg-primary-light border border-primary-border rounded-2xl p-4">
                <span className="text-xs font-semibold text-primary-text uppercase tracking-wider">
                  {t.pos.totalDueLabel}
                </span>
                <div className="text-3xl font-bold text-primary-text mt-1">
                  ฿{total.toLocaleString()}
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500 dark:text-slate-400">
                  {t.pos.choosePaymentMethod}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                      paymentMethod === 'promptpay'
                        ? 'border-primary bg-primary-light text-primary-text ring-1 ring-primary'
                        : isDark
                        ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <QrCode className="w-6 h-6" />
                    <span className="text-xs font-bold">{t.pos.paymentMethods.promptpay}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-primary bg-primary-light text-primary-text ring-1 ring-primary'
                        : isDark
                        ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Banknote className="w-6 h-6" />
                    <span className="text-xs font-bold">{t.pos.paymentMethods.cash}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'border-primary bg-primary-light text-primary-text ring-1 ring-primary'
                        : isDark
                        ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="text-xs font-bold">{t.pos.paymentMethods.credit_card}</span>
                  </button>
                </div>
              </div>

              {/* Conditional Payment details */}
              {paymentMethod === 'promptpay' && (
                <div className={`rounded-2xl p-4 text-center border flex flex-col items-center ${
                  isDark ? 'bg-[#232936] border-[rgba(255,255,255,0.06)]' : 'bg-[#fbfbf9] border-[#ebe7df]'
                }`}>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {t.pos.scanPromptPay}
                  </span>
                  {/* Generated Mock QR */}
                  <div className="w-40 h-40 bg-white p-2.5 rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=PROMPTPAY-YUMMY-POS-${total}`}
                      alt="PromptPay QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    {t.pos.promptPayDesc}
                  </span>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="space-y-3">
                  <div>
                    <PosInput
                      label={t.pos.cashReceivedField}
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                    />
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex gap-2">
                    {[total, 100, 500, 1000].map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCashReceived(String(Math.ceil(amt)))}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                          isDark ? 'bg-[#232936] hover:bg-slate-700 text-slate-200' : 'bg-[#f5f4ef] hover:bg-[#ebe7df] text-slate-700'
                        }`}
                      >
                        ฿{Math.ceil(amt)}
                      </button>
                    ))}
                  </div>

                  {/* Change calculation */}
                  <div className={`p-3 rounded-xl flex justify-between items-center text-sm ${
                    isDark ? 'bg-[#232936]' : 'bg-[#f5f4ef]'
                  }`}>
                    <span className="font-medium text-slate-600 dark:text-slate-400">{t.pos.changeLabel}:</span>
                    <span
                      className={`text-lg font-bold ${
                        cashChange >= 0 ? 'text-primary-text' : 'text-red-500'
                      }`}
                    >
                      ฿{cashChange.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Confirm CTA */}
              <button
                onClick={handleConfirmPayment}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{t.pos.confirmPayment}</span>
              </button>
            </div>
          </div>
      </Dialog>

      {/* MODAL: Printable Receipt Modal */}
      <Dialog
        open={Boolean(currentReceipt)}
        onClose={() => setCurrentReceipt(null)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobileScreen}
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
        {currentReceipt && (
          <div className="bg-white dark:bg-[#1a202c] rounded-[28px] w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-white/10 text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="p-4 bg-primary text-white flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {t.pos.transactionSuccess}
              </span>
              <button
                onClick={() => setCurrentReceipt(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Printable Card */}
            <div id="printable-receipt" className="p-6 font-mono text-xs text-slate-800 bg-white">
              <div className="text-center pb-4 border-b border-dashed border-slate-300">
                <h2 className="text-base font-black tracking-wider uppercase">YUMMY POS</h2>
                <p className="text-[11px] text-slate-600 mt-0.5">{t.pos.storeBranch}</p>
                <p className="text-[10px] text-slate-600">{t.pos.storeContact}</p>
                <div className="mt-2 text-[10px] text-slate-600">
                  <div>{t.pos.receiptNo}: {currentReceipt.receiptNumber}</div>
                  <div>
                    {t.pos.date}:{' '}
                    {new Date(currentReceipt.timestamp).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </div>
                  <div>{t.pos.cashier}: {currentReceipt.cashierName}</div>
                  {currentReceipt.customerName && (
                    <div className="text-[#387258] font-bold">{t.pos.customer}: {currentReceipt.customerName}</div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
                {currentReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="pr-2">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-slate-600">
                        {item.quantity} × ฿{item.price}
                      </div>
                    </div>
                    <span className="font-bold">฿{item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>{t.pos.subtotal}</span>
                  <span>฿{currentReceipt.subtotal.toLocaleString()}</span>
                </div>
                {currentReceipt.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{t.pos.discount}</span>
                    <span>-฿{currentReceipt.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>{t.pos.vat}</span>
                  <span>฿{currentReceipt.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-200">
                  <span>{t.pos.netTotal}</span>
                  <span>฿{currentReceipt.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method Details */}
              <div className="py-2.5 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span>{t.pos.paymentChannel}:</span>
                  <span className="font-bold uppercase">
                    {currentReceipt.paymentMethod === 'promptpay'
                      ? t.pos.paidPromptPay
                      : currentReceipt.paymentMethod === 'cash'
                      ? t.pos.paidCash
                      : t.pos.paidCard}
                  </span>
                </div>
                {currentReceipt.paymentMethod === 'cash' && (
                  <>
                    <div className="flex justify-between">
                      <span>{t.pos.receivedAmount}:</span>
                      <span>฿{currentReceipt.amountReceived?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>{t.pos.changeLabel}:</span>
                      <span>฿{currentReceipt.change?.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center pt-3 text-[10px] text-slate-600">
                <p>*** {t.pos.thankYou} ***</p>
                <p className="mt-0.5">{t.pos.keepReceipt}</p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-white/10 flex gap-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{t.pos.printReceipt}</span>
              </button>
              <button
                onClick={() => setCurrentReceipt(null)}
                className="flex-1 py-2.5 px-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>{t.pos.newOrder}</span>
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* QUICK ADD CUSTOMER MODAL */}
      <Dialog
        open={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobileScreen}
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
        <div className="w-full p-6 sm:p-7 rounded-[28px] liquid-glass-card shadow-2xl border text-slate-800 dark:text-white">
            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              {t.customers.addCustomerBtn}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {t.pos.addCustomerDesc}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCustName.trim()) return;
                addCustomer({ name: newCustName.trim(), phone: newCustPhone.trim() });
                setNewCustName('');
                setNewCustPhone('');
                setShowAddCustomerModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <PosInput
                  label={`${t.customers.name} *`}
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder={t.pos.customerNamePlaceholder}
                />
              </div>

              <div>
                <PosInput
                  label={`${t.customers.phone} (${t.common.points})`}
                  type="tel"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder={t.pos.customerPhonePlaceholder}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-hover cursor-pointer"
                >
                  {t.pos.saveCustomerBtn}
                </button>
              </div>
            </form>
        </div>
      </Dialog>

      {/* CUSTOMER SEARCH & SELECTION MODAL */}
      <CustomerSearchDialog
        open={showCustomerSearchModal}
        onClose={() => setShowCustomerSearchModal(false)}
        selectedCustomerId={selectedCustomer?.id}
        onSelectCustomer={(customer) => setSelectedCustomer(customer)}
        onOpenAddCustomer={() => setShowAddCustomerModal(true)}
      />

      {/* Shift Management Modal (Open / Close shift directly from POS screen) */}
      <ShiftModal
        isOpen={shiftModalMode !== null}
        mode={shiftModalMode || 'open'}
        onClose={() => setShiftModalMode(null)}
      />

      {/* UNIT SELECTOR MODAL (WHEN A PRODUCT WITH PACKAGING UNITS IS CLICKED) */}
      <Dialog
        open={Boolean(unitSelectProduct)}
        onClose={() => setUnitSelectProduct(null)}
        maxWidth="sm"
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
              maxWidth: '520px',
            },
          },
        }}
      >
        {unitSelectProduct && (
          <div className="bg-white/95 dark:bg-[#151922]/95 backdrop-blur-2xl rounded-[28px] w-full overflow-hidden shadow-[0_24px_64px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.95)] border border-[#ebe7df]/80 dark:border-white/[0.08]">
            {/* Header */}
            <div className="p-4.5 bg-gradient-to-r from-primary to-[var(--theme-primary-hover)] text-white flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-white/90" />
                <h3 className="font-bold text-sm sm:text-base">
                  เลือกหน่วยขาย (Select Unit)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUnitSelectProduct(null)}
                className="text-white/80 hover:text-white p-1 rounded-xl transition cursor-pointer active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Product Info Card */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-[#ebe7df]/80 dark:border-white/[0.06]">
                <img
                  src={unitSelectProduct.image}
                  alt={unitSelectProduct.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                    {unitSelectProduct.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      สต็อกคงเหลือทั้งหมด:
                    </span>
                    <span className="font-bold text-primary-text font-mono">
                      {unitSelectProduct.stock.toLocaleString()} {unitSelectProduct.baseUnit || 'ชิ้น'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Units Selection Cards */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  เลือกหน่วยที่ต้องการขาย:
                </p>

                {/* 1. Base Unit Option */}
                {(() => {
                  const baseUnitName = unitSelectProduct.baseUnit || 'ชิ้น';
                  const isAvailable = unitSelectProduct.stock >= 1;
                  return (
                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        addToCart(unitSelectProduct);
                        setUnitSelectProduct(null);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98] ${
                        isAvailable
                          ? 'bg-white dark:bg-white/[0.04] hover:bg-primary-light/60 border-slate-200/90 dark:border-white/10 hover:border-primary/50 shadow-xs'
                          : 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-white/[0.02] border-slate-200/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary-text transition-colors">
                            1 {baseUnitName} (หน่วยเดี่ยว)
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                            มาตรฐาน
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 block">
                          คงเหลือ {unitSelectProduct.stock} {baseUnitName}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold font-mono text-primary-text block">
                          ฿{unitSelectProduct.price.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-semibold text-primary group-hover:underline">
                          + เพิ่มลงตะกร้า
                        </span>
                      </div>
                    </button>
                  );
                })()}

                {/* 2. Packaging Units Options */}
                {unitSelectProduct.units?.map((unit) => {
                  const baseUnitName = unitSelectProduct.baseUnit || 'ชิ้น';
                  const isAvailable = unitSelectProduct.stock >= unit.multiplier;
                  const equivCount = Math.floor(unitSelectProduct.stock / unit.multiplier);
                  const remCount = unitSelectProduct.stock % unit.multiplier;
                  const savings = unitSelectProduct.price * unit.multiplier - unit.price;

                  return (
                    <button
                      key={unit.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        addToCart(unitSelectProduct, unit);
                        setUnitSelectProduct(null);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98] ${
                        isAvailable
                          ? 'bg-white dark:bg-white/[0.04] hover:bg-primary-light/60 border-slate-200/90 dark:border-white/10 hover:border-primary/50 shadow-xs'
                          : 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-white/[0.02] border-slate-200/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary-text transition-colors">
                            {unit.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                            บรรจุ {unit.multiplier} {baseUnitName}
                          </span>
                          {savings > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                              ประหยัด ฿{savings.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 block">
                          {isAvailable
                            ? `มีสต็อกพอสำหรับ ${equivCount} ${unit.name} ${remCount > 0 ? `(เศษ ${remCount} ${baseUnitName})` : ''}`
                            : `สต็อกไม่พอ (ต้องการ ${unit.multiplier} ${baseUnitName})`}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold font-mono text-primary-text block">
                          ฿{unit.price.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-semibold text-primary group-hover:underline">
                          + เพิ่มลงตะกร้า
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </Box>
  );
};
