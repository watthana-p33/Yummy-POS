import React, { useState, useMemo } from 'react';
import { usePos } from '../../context/PosContext';
import type { Product, ProductUnit } from '../../types/pos';
import { exportStyledExcel, type ExcelColumn } from '../../utils/excelExport';
import {
  PosCard,
  PosButton,
  PosInput,
  PosSelect,
  StockBadge,
  PosTable,
  AddCategoryModal,
  type PosTableColumn,
  PageHeader,
  PageContainer,
  PosLabelAction,
} from '../common';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  FolderPlus,
  Download,
  Calculator,
  Layers,
  Check,
} from 'lucide-react';

const getBreakdownSummary = (stock: number, baseUnit = 'ชิ้น', units?: ProductUnit[]): string => {
  if (!units || units.length === 0 || stock <= 0) return '';
  const sorted = [...units].sort((a, b) => b.multiplier - a.multiplier);
  let remaining = stock;
  const parts: string[] = [];

  for (const u of sorted) {
    if (u.multiplier > 1 && remaining >= u.multiplier) {
      const count = Math.floor(remaining / u.multiplier);
      remaining = remaining % u.multiplier;
      parts.push(`${count} ${u.name}`);
    }
  }

  if (remaining > 0) {
    parts.push(`${remaining} ${baseUnit}`);
  }

  return parts.length > 0 ? parts.join(', ') : '';
};

const BASE_UNIT_OPTIONS = [
  { value: 'ชิ้น', label: 'ชิ้น (Piece)' },
  { value: 'ขวด', label: 'ขวด (Bottle)' },
  { value: 'กระป๋อง', label: 'กระป๋อง (Can)' },
  { value: 'แก้ว', label: 'แก้ว (Cup)' },
  { value: 'กล่อง', label: 'กล่อง (Box)' },
  { value: 'ซอง', label: 'ซอง (Sachet/Bag)' },
  { value: 'ถุง', label: 'ถุง (Bag)' },
  { value: 'จาน', label: 'จาน (Plate)' },
  { value: 'ถ้วย', label: 'ถ้วย (Bowl)' },
  { value: 'ชุด', label: 'ชุด (Set)' },
  { value: 'ไม้', label: 'ไม้ (Skewer)' },
  { value: 'แผง', label: 'แผง (Tray/Panel)' },
];

export const ProductManagementScreen: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories, t, language } = usePos();
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    baseUnit: string;
    price: string;
    stock: string;
    barcode: string;
    image: string;
    units: ProductUnit[];
  }>({
    name: '',
    category: 'drinks',
    baseUnit: 'ชิ้น',
    price: '',
    stock: '',
    barcode: '',
    image: '',
    units: [],
  });

  // Stock Inflow Helper State
  const [showStockHelper, setShowStockHelper] = useState<boolean>(false);
  const [calcInputs, setCalcInputs] = useState<Record<string, string>>({});

  const baseUnitOptions = useMemo(() => {
    const list = [...BASE_UNIT_OPTIONS];
    if (formData.baseUnit && !list.some((u) => u.value === formData.baseUnit)) {
      return [{ value: formData.baseUnit, label: `${formData.baseUnit} (${t.products.customUnitSuffix})` }, ...list];
    }
    return list;
  }, [formData.baseUnit, t.products.customUnitSuffix]);

  const handleBaseUnitChange = (val: string) => {
    if (val === '__custom__') {
      const custom = window.prompt(t.products.customUnitPrompt);
      if (custom && custom.trim()) {
        setFormData((prev) => ({ ...prev, baseUnit: custom.trim() }));
      }
    } else {
      setFormData((prev) => ({ ...prev, baseUnit: val }));
    }
  };

  // Filter products
  const getCategoryLabel = (catId: string, fallbackName?: string) => {
    if (catId === 'all') return t.pos.categories.all;
    const found = categories.find((c) => c.id === catId);
    if (found) {
      const translated =
        (t.pos.categories as Record<string, string>)[catId] ||
        (t.pos.categories as Record<string, string>)[catId.replace(/s$/, '')];
      return translated || `${found.icon} ${found.name}`;
    }
    return fallbackName || catId;
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  const productColumns: PosTableColumn<Product>[] = [
    {
      id: 'image',
      header: t.products.image,
      width: 70,
      sortable: false,
      filterable: false,
      render: (p) => (
        <img
          src={p.image}
          alt={p.name}
          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-xs"
        />
      ),
    },
    {
      id: 'name',
      header: t.products.nameAndBarcode,
      render: (p) => (
        <div>
          <div className="font-bold text-slate-800 dark:text-slate-100">{p.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {p.barcode ? `#${p.barcode}` : '-'}
          </div>
        </div>
      ),
    },
    {
      id: 'category',
      header: t.products.category,
      filterOptions: categories.map((c) => {
        const label = getCategoryLabel(c.id, c.name);
        const displayLabel = label.includes(c.icon) ? label : `${c.icon} ${label}`;
        return {
          label: displayLabel,
          value: c.id,
        };
      }),
      render: (p) => (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
          {getCategoryLabel(p.category)}
        </span>
      ),
    },
    {
      id: 'price',
      header: t.products.price,
      align: 'right',
      render: (p) => (
        <div className="text-right">
          <div>
            <span
              className="font-bold font-mono text-sm"
              style={{ color: 'var(--theme-primary)' }}
            >
              ฿{p.price.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans ml-1">
              /{p.baseUnit || 'ชิ้น'}
            </span>
          </div>
          {p.units && p.units.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-end mt-1">
              {p.units.map((u) => (
                <span
                  key={u.id}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary-light text-primary-text font-semibold border border-primary-border/40 whitespace-nowrap"
                  title={`${u.name} (บรรจุ ${u.multiplier} ${p.baseUnit || 'ชิ้น'})`}
                >
                  {u.name}: ฿{u.price.toLocaleString()}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'stock',
      header: t.products.stock,
      align: 'right',
      render: (p) => {
        const summary = getBreakdownSummary(p.stock, p.baseUnit || 'ชิ้น', p.units);
        return (
          <div className="text-right">
            <div>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-100">
                {p.stock.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-sans ml-1">
                {p.baseUnit || 'ชิ้น'}
              </span>
            </div>
            {summary && (
              <div
                className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5 flex items-center justify-end gap-1"
                title={`เทียบเท่า: ${summary}`}
              >
                <Layers className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span>{summary}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: t.common.status,
      align: 'center',
      sortKey: 'stock',
      render: (p) => <StockBadge stock={p.stock} iconOnly />,
    },
    {
      id: 'actions',
      header: t.products.manage,
      align: 'center',
      sortable: false,
      filterable: false,
      render: (p) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => handleOpenEditModal(p)}
            title={t.common.edit}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary-light rounded-xl transition cursor-pointer active:scale-95"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteConfirmId(p.id)}
            title={t.common.delete}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'drinks',
      baseUnit: 'ชิ้น',
      price: '',
      stock: '',
      barcode: `88500${Math.floor(10 + Math.random() * 90)}`,
      image:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      units: [],
    });
    setCalcInputs({});
    setShowStockHelper(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    const productUnits = product.units ? [...product.units] : [];
    setFormData({
      name: product.name,
      category: product.category,
      baseUnit: product.baseUnit || 'ชิ้น',
      price: String(product.price),
      stock: String(product.stock),
      barcode: product.barcode || '',
      image: product.image,
      units: productUnits,
    });
    const initialCalc: Record<string, string> = {};
    if (productUnits.length > 0 && product.stock > 0) {
      const sorted = [...productUnits].sort((a, b) => b.multiplier - a.multiplier);
      let rem = product.stock;
      for (const u of sorted) {
        if (u.multiplier > 1 && rem >= u.multiplier) {
          const cnt = Math.floor(rem / u.multiplier);
          rem = rem % u.multiplier;
          initialCalc[u.id] = String(cnt);
        }
      }
      initialCalc['base'] = String(rem);
    }
    setCalcInputs(initialCalc);
    setShowStockHelper(false);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert(t.products.requiredAlert);
      return;
    }

    const priceNum = parseFloat(formData.price) || 0;
    const stockNum = parseInt(formData.stock, 10) || 0;
    const baseUnit = formData.baseUnit.trim() || 'ชิ้น';

    let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (stockNum <= 0) status = 'out_of_stock';
    else if (stockNum < 10) status = 'low_stock';

    const cleanUnits = formData.units.filter((u) => u.name.trim() && u.multiplier > 1 && u.price > 0);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        category: formData.category,
        baseUnit,
        price: priceNum,
        stock: stockNum,
        barcode: formData.barcode.trim(),
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        status,
        units: cleanUnits,
      });
    } else {
      addProduct({
        name: formData.name.trim(),
        category: formData.category,
        baseUnit,
        price: priceNum,
        stock: stockNum,
        barcode: formData.barcode.trim(),
        image:
          formData.image ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        status,
        units: cleanUnits,
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteProduct(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleExportExcel = () => {
    const totalStock = filteredProducts.reduce((sum, p) => sum + p.stock, 0);
    const totalInventoryValue = filteredProducts.reduce((sum, p) => sum + p.price * p.stock, 0);
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

    const columns: ExcelColumn<Product>[] = [
      {
        key: 'barcode',
        header: 'บาร์โค้ด / รหัส (Barcode)',
        width: 18,
        align: 'center',
        formatter: (v) => (v ? `#${v}` : '-'),
      },
      {
        key: 'name',
        header: 'ชื่อสินค้า (Product Name)',
        width: 32,
        align: 'left',
      },
      {
        key: 'category',
        header: 'หมวดหมู่ (Category)',
        width: 20,
        align: 'center',
        formatter: (v) => getCategoryLabel(v),
      },
      {
        key: 'price',
        header: 'ราคาขาย (Price THB)',
        width: 20,
        align: 'right',
        formatter: (v, p) => `฿${Number(v).toLocaleString()} / ${p.baseUnit || 'ชิ้น'}`,
      },
      {
        key: 'stock',
        header: 'คงเหลือ (Stock Qty)',
        width: 26,
        align: 'right',
        formatter: (v, p) => {
          const summary = getBreakdownSummary(Number(v), p.baseUnit || 'ชิ้น', p.units);
          return summary
            ? `${Number(v).toLocaleString()} ${p.baseUnit || 'ชิ้น'} (${summary})`
            : `${Number(v).toLocaleString()} ${p.baseUnit || 'ชิ้น'}`;
        },
      },
      {
        key: 'units',
        header: 'หน่วยขายเพิ่มเติม (Units)',
        width: 30,
        align: 'left',
        formatter: (_v, p) =>
          p.units && p.units.length > 0
            ? p.units.map((u) => `${u.name} (x${u.multiplier} = ฿${u.price.toLocaleString()})`).join(', ')
            : '-',
      },
      {
        key: 'status',
        header: 'สถานะสต็อก (Stock Status)',
        width: 18,
        align: 'center',
        formatter: (_v, p) =>
          p.stock > 10 ? 'พร้อมขาย' : p.stock > 0 ? 'สินค้าใกล้หมด' : 'สินค้าหมด',
      },
    ];

    exportStyledExcel({
      fileName: `YummyPOS_Products_${dateStr}.xlsx`,
      sheetName: 'Products',
      title: `🍽️ ${t.common.appName || 'YUMMY POS'} — รายการสินค้าและสต็อก (PRODUCT INVENTORY)`,
      subtitle: `สาขา: ${t.pos?.storeBranch || 'สาขาหลัก Central Food Court'}   |   วันที่ออกรายงาน: ${now.toLocaleDateString('th-TH')} ${now.toLocaleTimeString('th-TH')}   |   หมวดหมู่: ${getCategoryLabel(selectedCategory)}`,
      kpiCards: [
        {
          title: '📦 จำนวนสินค้าที่แสดง (PRODUCTS COUNT)',
          value: `${filteredProducts.length} รายการ`,
        },
        {
          title: '📊 จำนวนสต็อกรวม (TOTAL STOCK UNITS)',
          value: `${totalStock.toLocaleString()} ชิ้น`,
        },
        {
          title: '💰 มูลค่าสต็อกรวม (TOTAL INVENTORY VALUE)',
          value: `฿${totalInventoryValue.toLocaleString()}`,
        },
      ],
      columns,
      data: filteredProducts,
      totalSummary: {
        label: 'รวมสต็อกทั้งหมด (TOTAL INVENTORY)',
        values: {
          stock: `${totalStock.toLocaleString()} ชิ้น`,
          price: `฿${totalInventoryValue.toLocaleString()}`,
        },
      },
    });
  };

  return (
    <PageContainer>
      {/* Header Banner */}
      <PageHeader
        icon={<Package className="w-6 h-6" />}
        title={t.products.title}
        subtitle={`${t.products.subtitle} (${products.length} ${t.common.all})`}
        actions={
          <>
            <PosButton
              variantStyle="secondary"
              onClick={handleExportExcel}
              startIcon={<Download className="w-4 h-4" />}
            >
              {t.common.exportExcel}
            </PosButton>
            <PosButton
              variantStyle="secondary"
              onClick={() => setIsCategoryModalOpen(true)}
              startIcon={<FolderPlus className="w-4 h-4" />}
            >
              {t.products.addCategoryBtn || 'เพิ่มหมวดหมู่'}
            </PosButton>
            <PosButton
              variantStyle="primary"
              onClick={handleOpenAddModal}
              startIcon={<Plus className="w-4 h-4" />}
            >
              {t.products.addNewBtn}
            </PosButton>
          </>
        }
      />

      {/* Filter and Search Bar */}
      <PosCard className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <PosInput
              placeholder={t.products.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />,
                },
              }}
            />
          </div>

          <div className="w-full sm:w-56">
            <PosSelect
              searchable
              searchPlaceholder={t.products.searchCategoryPlaceholder}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as string)}
            >
              {categories.map((cat) => {
                const label = getCategoryLabel(cat.id, cat.name);
                const displayLabel = label.includes(cat.icon) ? label : `${cat.icon} ${label}`;
                return (
                  <MenuItem key={cat.id} value={cat.id}>
                    {displayLabel}
                  </MenuItem>
                );
              })}
            </PosSelect>
          </div>
        </div>
      </PosCard>

      {/* MOBILE CARD VIEW (< md) */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
        {filteredProducts.length === 0 ? (
          <PosCard className="p-8 text-center text-slate-400">
            {t.products.noProductsFound}
          </PosCard>
        ) : (
          filteredProducts.map((p) => (
            <PosCard
              key={p.id}
              hoverable
              className="p-4 flex items-center justify-between gap-3"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-white/10 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                    {getCategoryLabel(p.category)}
                  </span>
                  <StockBadge stock={p.stock} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate mt-1">{p.name}</h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-bold text-primary-text">฿{p.price.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.products.stock}: {p.stock}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleOpenEditModal(p)}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary-light rounded-xl transition cursor-pointer"
                  title={t.common.edit}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(p.id)}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer"
                  title={t.common.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </PosCard>
          ))
        )}
      </Box>

      {/* DESKTOP / TABLET PRODUCT TABLE (>= md) WITH POS TABLE & PAGINATION */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <PosTable
          columns={productColumns}
          data={filteredProducts}
          keyExtractor={(p) => p.id}
          variant="panel"
          minWidth={650}
          emptyMessage={t.products.noProductsFound}
          enablePagination={true}
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 20, 50]}
          maxHeight={640}
        />
      </Box>

      {/* MODAL: Add / Edit Product */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
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
              maxWidth: '720px',
            },
          },
        }}
      >
        <div className="bg-white/95 dark:bg-[#151922]/95 backdrop-blur-2xl rounded-[28px] w-full overflow-hidden shadow-[0_24px_64px_-12px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.95)] border border-[#ebe7df]/80 dark:border-white/[0.08]">
          <div className="p-5 bg-gradient-to-r from-primary to-[var(--theme-primary-hover)] text-white flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-white/90" />
              <h3 className="font-bold text-base">
                {editingProduct ? t.products.editTitle : t.products.addTitle}
              </h3>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-xl transition cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            {/* Product Name */}
            <div>
              <PosInput
                outsideLabel
                required
                label={t.products.nameLabel}
                placeholder={t.products.namePlaceholder}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Barcode / SKU */}
            <div>
              <PosInput
                outsideLabel
                label={t.products.barcodeLabel}
                placeholder="8850001"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>

            {/* Category & Base Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <PosSelect
                  outsideLabel
                  required
                  label={t.products.categoryLabel}
                  size="medium"
                  searchable
                  searchPlaceholder={t.products.searchCategoryPlaceholder}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as string })}
                >
                  {categories.filter((c) => c.id !== 'all').map((cat) => {
                    const label = getCategoryLabel(cat.id, cat.name);
                    const displayLabel = label.includes(cat.icon) ? label : `${cat.icon} ${label}`;
                    return (
                      <MenuItem key={cat.id} value={cat.id}>
                        {displayLabel}
                      </MenuItem>
                    );
                  })}
                </PosSelect>
              </div>

              <div>
                <PosSelect
                  outsideLabel
                  required
                  label={t.products.baseUnitLabel}
                  size="medium"
                  searchable
                  searchPlaceholder={t.products.baseUnitSearchPlaceholder}
                  value={formData.baseUnit}
                  onChange={(e) => handleBaseUnitChange(e.target.value as string)}
                >
                  {baseUnitOptions.map((u) => (
                    <MenuItem key={u.value} value={u.value}>
                      {u.label}
                    </MenuItem>
                  ))}
                  <MenuItem value="__custom__" sx={{ color: 'var(--theme-primary)', fontWeight: 600 }}>
                    {t.products.customUnitOption}
                  </MenuItem>
                </PosSelect>
              </div>
            </div>

            {/* Base Price & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <PosInput
                  outsideLabel
                  required
                  label={t.products.pricePerUnitLabel.replace('{unit}', formData.baseUnit || t.products.defaultUnitName)}
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <PosInput
                  outsideLabel
                  required
                  label={t.products.stockInUnitLabel.replace('{unit}', formData.baseUnit || t.products.defaultUnitName)}
                  labelRight={
                    <PosLabelAction
                      icon={<Calculator className="w-3.5 h-3.5" />}
                      onClick={() => setShowStockHelper((prev) => !prev)}
                      title={t.products.stockHelperTooltip}
                    >
                      {showStockHelper ? t.products.stockHelperToggleHide : t.products.stockHelperToggleShow}
                    </PosLabelAction>
                  }
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>

            {/* STOCK INFLOW / CALCULATOR HELPER */}
            {showStockHelper && (
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                    <Calculator className="w-4 h-4 text-primary" />
                    <span>{t.products.stockHelperTitle}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.products.stockHelperDesc}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {formData.units.length > 0 ? (
                    formData.units.map((u) => (
                      <div key={u.id} className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block truncate">
                          {u.name} (x{u.multiplier} {formData.baseUnit || t.products.defaultUnitName})
                        </label>
                        <PosInput
                          type="number"
                          placeholder="0"
                          value={calcInputs[u.id] || ''}
                          onChange={(e) =>
                            setCalcInputs({ ...calcInputs, [u.id]: e.target.value })
                          }
                        />
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block">
                          {t.products.stockHelperCrate.replace('{unit}', formData.baseUnit || t.products.defaultUnitName)}
                        </label>
                        <PosInput
                          type="number"
                          placeholder="0"
                          value={calcInputs['crate-24'] || ''}
                          onChange={(e) =>
                            setCalcInputs({ ...calcInputs, 'crate-24': e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block">
                          {t.products.stockHelperPack.replace('{unit}', formData.baseUnit || t.products.defaultUnitName)}
                        </label>
                        <PosInput
                          type="number"
                          placeholder="0"
                          value={calcInputs['pack-6'] || ''}
                          onChange={(e) =>
                            setCalcInputs({ ...calcInputs, 'pack-6': e.target.value })
                          }
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block">
                      {t.products.stockHelperSingle.replace('{unit}', formData.baseUnit || t.products.defaultUnitName)}
                    </label>
                    <PosInput
                      type="number"
                      placeholder="0"
                      value={calcInputs['base'] || ''}
                      onChange={(e) => setCalcInputs({ ...calcInputs, base: e.target.value })}
                    />
                  </div>
                </div>

                {/* Calculate summary */}
                {(() => {
                  let totalCalc = 0;
                  if (formData.units.length > 0) {
                    formData.units.forEach((u) => {
                      const count = parseInt(calcInputs[u.id] || '0', 10) || 0;
                      totalCalc += count * u.multiplier;
                    });
                  } else {
                    const crates = parseInt(calcInputs['crate-24'] || '0', 10) || 0;
                    const packs = parseInt(calcInputs['pack-6'] || '0', 10) || 0;
                    totalCalc += crates * 24 + packs * 6;
                  }
                  totalCalc += parseInt(calcInputs['base'] || '0', 10) || 0;

                  return (
                    <div className="flex items-center justify-between pt-2 border-t border-primary/15">
                      <div className="text-xs">
                        <span className="text-slate-600 dark:text-slate-300">{t.products.stockHelperResult} </span>
                        <span className="font-bold font-mono text-primary-text text-sm">
                          {totalCalc.toLocaleString()} {formData.baseUnit || t.products.defaultUnitName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, stock: String(totalCalc) })}
                        className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.products.stockHelperApply}</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* PACKAGING UNITS (PACK / CRATE) CONFIGURATION */}
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[#ebe7df] dark:border-white/[0.08] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-primary" />
                    <span>{t.products.packagingSectionTitle}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {t.products.packagingSectionDesc}
                  </p>
                </div>

                {/* Quick Add Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const basePrice = parseFloat(formData.price) || 0;
                      const suggestedPrice = Math.round(basePrice * 6 * 0.95) || basePrice * 6;
                      const newUnit: ProductUnit = {
                        id: `unit-pack-${Date.now()}`,
                        name: `${language === 'th' ? 'แพ็ค' : 'Pack'} (6 ${formData.baseUnit || t.products.defaultUnitName})`,
                        multiplier: 6,
                        price: suggestedPrice,
                      };
                      setFormData({ ...formData, units: [...formData.units, newUnit] });
                    }}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-white/5 hover:bg-primary-light hover:text-primary-text border border-slate-200 dark:border-white/10 transition cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3 h-3 text-primary" />
                    <span>{t.products.addPack6Btn.replace('{unit}', formData.baseUnit || t.products.defaultUnitName)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const basePrice = parseFloat(formData.price) || 0;
                      const suggestedPrice = Math.round(basePrice * 24 * 0.9) || basePrice * 24;
                      const newUnit: ProductUnit = {
                        id: `unit-crate-${Date.now()}`,
                        name: `${language === 'th' ? 'ลัง' : 'Crate'} (24 ${formData.baseUnit || t.products.defaultUnitName})`,
                        multiplier: 24,
                        price: suggestedPrice,
                      };
                      setFormData({ ...formData, units: [...formData.units, newUnit] });
                    }}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-white/5 hover:bg-primary-light hover:text-primary-text border border-slate-200 dark:border-white/10 transition cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3 h-3 text-primary" />
                    <span>{t.products.addCrate24Btn.replace('{unit}', formData.baseUnit || t.products.defaultUnitName)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const basePrice = parseFloat(formData.price) || 0;
                      const newUnit: ProductUnit = {
                        id: `unit-custom-${Date.now()}`,
                        name: `${language === 'th' ? 'แพ็ค' : 'Pack'} (12 ${formData.baseUnit || t.products.defaultUnitName})`,
                        multiplier: 12,
                        price: basePrice * 12,
                      };
                      setFormData({ ...formData, units: [...formData.units, newUnit] });
                    }}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t.products.addCustomUnitBtn}</span>
                  </button>
                </div>
              </div>

              {/* Units List */}
              {formData.units.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center text-xs text-slate-400 dark:text-slate-500">
                  {t.products.noAdditionalUnits.replace('{unit}', formData.baseUnit || t.products.defaultUnitName)}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {formData.units.map((unit, idx) => (
                    <div
                      key={unit.id}
                      className="p-3 rounded-xl bg-white/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-wrap items-center gap-2"
                    >
                      <div className="flex-1 min-w-[140px]">
                        <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                          {t.products.unitNameLabel}
                        </label>
                        <PosInput
                          placeholder={t.products.unitNamePlaceholder}
                          value={unit.name}
                          onChange={(e) => {
                            const updated = [...formData.units];
                            updated[idx].name = e.target.value;
                            setFormData({ ...formData, units: updated });
                          }}
                        />
                      </div>

                      <div className="w-24 min-w-[80px]">
                        <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                          {t.products.unitMultiplierLabel.replace('{unit}', formData.baseUnit || t.products.defaultUnitName)}
                        </label>
                        <PosInput
                          type="number"
                          placeholder={t.products.unitMultiplierPlaceholder}
                          value={unit.multiplier}
                          onChange={(e) => {
                            const updated = [...formData.units];
                            updated[idx].multiplier = Math.max(1, parseInt(e.target.value, 10) || 1);
                            setFormData({ ...formData, units: updated });
                          }}
                        />
                      </div>

                      <div className="w-28 min-w-[90px]">
                        <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                          {t.products.unitPriceLabel}
                        </label>
                        <PosInput
                          type="number"
                          placeholder={t.products.unitPricePlaceholder}
                          value={unit.price}
                          onChange={(e) => {
                            const updated = [...formData.units];
                            updated[idx].price = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, units: updated });
                          }}
                        />
                      </div>

                      <div className="w-28 min-w-[90px]">
                        <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                          {t.products.unitBarcodeLabel}
                        </label>
                        <PosInput
                          placeholder="Barcode"
                          value={unit.barcode || ''}
                          onChange={(e) => {
                            const updated = [...formData.units];
                            updated[idx].barcode = e.target.value;
                            setFormData({ ...formData, units: updated });
                          }}
                        />
                      </div>

                      <div className="pt-5">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              units: formData.units.filter((_, uIdx) => uIdx !== idx),
                            });
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer active:scale-95"
                          title={t.products.deleteUnitTooltip}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image URL */}
            <div>
              <PosInput
                outsideLabel
                label={t.products.imageUrlLabel}
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>

            <div className="pt-3 flex gap-3">
              <PosButton
                type="button"
                variantStyle="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                {t.common.cancel}
              </PosButton>
              <PosButton
                type="submit"
                variantStyle="primary"
                startIcon={<Save className="w-4 h-4" />}
                className="flex-1"
              >
                {t.products.saveProductBtn}
              </PosButton>
            </div>
          </form>
        </div>
      </Dialog>

      {/* CONFIRM DELETE MODAL */}
      <Dialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
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
        <div className="bg-white/95 dark:bg-[#151922]/95 backdrop-blur-2xl rounded-[28px] w-full p-6 text-center shadow-[0_24px_64px_-12px_rgba(0,0,0,0.3)] border border-[#ebe7df]/80 dark:border-white/[0.08] space-y-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white">{t.products.deleteConfirmTitle}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {t.products.deleteConfirmDesc}
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <PosButton
              variantStyle="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1"
            >
              {t.common.cancel}
            </PosButton>
            <PosButton
              variantStyle="danger"
              onClick={handleDeleteConfirm}
              className="flex-1"
            >
              {t.products.confirmDeleteBtn}
            </PosButton>
          </div>
        </div>
      </Dialog>

      {/* ADD CATEGORY MODAL */}
      <AddCategoryModal
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryCreated={(newCat) => {
          if (isModalOpen) {
            setFormData((prev) => ({ ...prev, category: newCat.id }));
          }
        }}
      />
    </PageContainer>
  );
};
