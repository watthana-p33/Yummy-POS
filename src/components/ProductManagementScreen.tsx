import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import type { Product } from '../types/pos';
import { CATEGORIES } from '../data/mockData';
import { PosCard, PosButton, PosInput, PosSelect, StockBadge, PosTable, type PosTableColumn } from './common';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
} from 'lucide-react';

export const ProductManagementScreen: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, t } = usePos();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'drinks',
    price: '',
    stock: '',
    barcode: '',
    image: '',
  });

  // Filter products
  const getCategoryLabel = (catId: string, fallbackName?: string) => {
    if (catId === 'all') return t.pos.categories.all;
    if (catId === 'drinks' || catId === 'drink') return t.pos.categories.drink;
    if (catId === 'food') return t.pos.categories.food;
    if (catId === 'dessert') return t.pos.categories.dessert;
    if (catId === 'snack') return t.pos.categories.snack;
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
      filterOptions: CATEGORIES.map((c) => ({
        label: `${c.icon} ${getCategoryLabel(c.id, c.name)}`,
        value: c.id,
      })),
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
        <span
          className="font-bold font-mono text-sm"
          style={{ color: 'var(--theme-primary)' }}
        >
          ฿{p.price.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'stock',
      header: t.products.stock,
      align: 'center',
      render: (p) => (
        <span className="font-bold font-mono text-slate-800 dark:text-slate-100">
          {p.stock}
        </span>
      ),
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
      price: '',
      stock: '',
      barcode: `88500${Math.floor(10 + Math.random() * 90)}`,
      image:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      barcode: product.barcode || '',
      image: product.image,
    });
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

    let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (stockNum <= 0) status = 'out_of_stock';
    else if (stockNum < 10) status = 'low_stock';

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        category: formData.category,
        price: priceNum,
        stock: stockNum,
        barcode: formData.barcode.trim(),
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        status,
      });
    } else {
      addProduct({
        name: formData.name.trim(),
        category: formData.category,
        price: priceNum,
        stock: stockNum,
        barcode: formData.barcode.trim(),
        image:
          formData.image ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        status,
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

  return (
    <div className="flex-1 px-4 lg:px-20 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Banner & Action */}
      <PosCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary-light text-primary-text flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.products.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.products.subtitle} ({products.length} {t.common.all})
              </p>
            </div>
          </div>

          <PosButton
            variantStyle="primary"
            onClick={handleOpenAddModal}
            startIcon={<Plus className="w-4 h-4" />}
          >
            {t.products.addNewBtn}
          </PosButton>
        </div>
      </PosCard>

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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as string)}
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.icon} {getCategoryLabel(cat.id, cat.name)}
                </MenuItem>
              ))}
            </PosSelect>
          </div>
        </div>
      </PosCard>

      {/* MOBILE CARD VIEW (< md) */}
      <div className="md:hidden space-y-3">
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
      </div>

      {/* DESKTOP / TABLET PRODUCT TABLE (>= md) WITH POS TABLE & PAGINATION */}
      <div className="hidden md:block">
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
          fixedHeight={640}
        />
      </div>

      {/* MODAL: Add / Edit Product */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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

          <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
            <div>
              <PosInput
                label={t.products.nameLabel}
                required
                placeholder={t.products.namePlaceholder}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <PosSelect
                  label={t.products.categoryLabel}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as string })}
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </PosSelect>
              </div>

              <div>
                <PosInput
                  label={t.products.barcodeLabel}
                  placeholder="8850001"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <PosInput
                  label={t.products.priceLabel}
                  type="number"
                  required
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <PosInput
                  label={t.products.stockLabel}
                  type="number"
                  required
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>

            <div>
              <PosInput
                label={t.products.imageUrlLabel}
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>

            <div className="pt-4 flex gap-3">
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
    </div>
  );
};
