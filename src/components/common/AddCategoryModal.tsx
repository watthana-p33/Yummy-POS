import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { usePos } from '../../context/PosContext';
import { PosInput } from './PosInput';
import { FolderPlus, X, Save, Sparkles } from 'lucide-react';
import type { Category } from '../../types/pos';

export interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onCategoryCreated?: (category: Category) => void;
}

const PRESET_EMOJIS = [
  '🍽️', '☕', '🍛', '🍰', '🍟', '🥤', '🍜', '🍕',
  '🍣', '🥗', '🍦', '🥐', '🥪', '🥩', '🍱', '🧋',
  '🍔', '🍲', '🍢', '🥟', '🍳', '🌮', '🍷', '✨',
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  open,
  onClose,
  onCategoryCreated,
}) => {
  const { categories, addCategory, themeMode, t } = usePos();
  const isDark = themeMode === 'dark';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🍽️');
  const [errorMsg, setErrorMsg] = useState('');

  const handleClose = () => {
    setName('');
    setIcon('🍽️');
    setErrorMsg('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg(t.products.categoryNameRequired || 'กรุณาระบุชื่อหมวดหมู่');
      return;
    }

    // Check duplicate
    const isDuplicate = categories.some(
      (c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMsg(
        t.products.categoryDuplicate
          ? t.products.categoryDuplicate.replace('{name}', trimmedName)
          : `หมวดหมู่ "${trimmedName}" มีอยู่ในระบบแล้ว`
      );
      return;
    }

    const created = addCategory({
      name: trimmedName,
      icon: icon.trim() || '🍽️',
    });

    onCategoryCreated?.(created);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
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
      <div className={`flex flex-col ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
        {/* Header */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between gap-3 ${
          isDark ? 'border-white/[0.08] bg-[#181d29]' : 'border-[#ebe7df] bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold tracking-tight truncate">
                {t.products.categoryModalTitle || 'เพิ่มหมวดหมู่สินค้าใหม่'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {t.products.categoryModalSubtitle || 'สร้างหมวดหมู่เพื่อจัดกลุ่มเมนูอาหารและเครื่องดื่ม'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              {errorMsg}
            </div>
          )}

          {/* Category Name */}
          <div>
            <PosInput
              outsideLabel
              required
              autoFocus
              label={t.products.categoryNameLabel || 'ชื่อหมวดหมู่'}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={t.products.categoryNamePlaceholder || 'เช่น สเต๊ก, ก๋วยเตี๋ยว, ชานมไข่มุก'}
            />
          </div>

          {/* Emoji / Icon Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.products.categoryIconLabel || 'สัญลักษณ์ Emoji / ไอคอน'}
            </label>

            {/* Quick preset chips */}
            <div className={`p-3 rounded-2xl border ${
              isDark ? 'border-white/[0.08] bg-[#181d29]/70' : 'border-[#ebe7df] bg-slate-50/60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {t.products.popularEmoji}
                </span>
                <span className="text-xs font-bold text-primary">
                  {t.products.selectedEmoji} {icon}
                </span>
              </div>
              <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                {PRESET_EMOJIS.map((emoji) => {
                  const isSelected = icon === emoji;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`h-9 rounded-xl flex items-center justify-center text-base transition cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-white scale-110 shadow-sm ring-2 ring-primary/40'
                          : isDark
                            ? 'bg-white/[0.04] hover:bg-white/[0.1] text-slate-200'
                            : 'bg-white hover:bg-slate-100 text-slate-800 shadow-2xs'
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between ${
            isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-[#ebe7df]/60 bg-slate-50/50'
          }`}>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.products.previewLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary-text border border-primary/20">
              <span>{icon}</span>
              <span>{name.trim() || t.products.categoryNameLabel.replace('*', '').trim()}</span>
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isDark
                  ? 'border-white/[0.1] text-slate-300 hover:bg-white/[0.05]'
                  : 'border-[#ebe7df] text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white transition shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.products.saveCategoryBtn || 'บันทึกหมวดหมู่'}</span>
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
