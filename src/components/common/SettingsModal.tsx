import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { usePos } from '../../context/PosContext';
import { ACCENT_THEMES, type AccentColor } from '../../theme/theme';
import { POPULAR_GOOGLE_FONTS } from '../../utils/fontStorage';
import {
  Settings,
  X,
  Check,
  Palette,
  Type,
  Globe,
  Sparkles,
  RotateCcw,
  Plus,
  Upload,
  Trash2,
  Cloud,
  FileUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    themeMode,
    accentColor,
    setAccentColor,
    fontFamily,
    setFontFamily,
    allFontOptions,
    addGoogleFont,
    addLocalFont,
    deleteCustomFont,
    language,
    setLanguage,
    t,
  } = usePos();

  const isDark = themeMode === 'dark';

  const handleResetDefaults = () => {
    setAccentColor('sage');
    setFontFamily('Comic Relief');
    setLanguage('th');
  };

  const currentAccent = ACCENT_THEMES[accentColor] || ACCENT_THEMES.sage;

  // Font Management States
  const [activeFontTab, setActiveFontTab] = useState<'none' | 'google' | 'upload'>('none');
  const [googleFontInput, setGoogleFontInput] = useState('');
  const [customFontNameInput, setCustomFontNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddGoogleFont = async (nameToAdd?: string) => {
    const targetName = (nameToAdd || googleFontInput).trim();
    if (!targetName) return;
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await addGoogleFont(targetName);
      if (res.success) {
        setStatusMessage({ type: 'success', text: `${t.settings.fontAddSuccess}: "${targetName}"` });
        setGoogleFontInput('');
        setActiveFontTab('none');
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Error' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await addLocalFont(file, customFontNameInput.trim() || undefined);
      if (res.success) {
        setStatusMessage({ type: 'success', text: `${t.settings.fontImportSuccess}: "${file.name}"` });
        setCustomFontNameInput('');
        setActiveFontTab('none');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Error' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomFont = async (e: React.MouseEvent, fontId: string, label: string) => {
    e.stopPropagation();
    if (window.confirm(`${t.settings.deleteFontConfirm} ("${label}")`)) {
      await deleteCustomFont(fontId);
      setStatusMessage({ type: 'success', text: `${t.settings.fontDeleteSuccess}: "${label}"` });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: isDark ? 'rgba(5, 7, 12, 0.72)' : 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(16px)',
          },
        },
        paper: {
          elevation: 0,
          sx: {
            borderRadius: '28px',
            overflow: 'hidden',
            backgroundColor: isDark ? 'rgba(18, 22, 34, 0.82)' : 'rgba(255, 255, 255, 0.84)',
            backdropFilter: 'blur(32px) saturate(190%)',
            WebkitBackdropFilter: 'blur(32px) saturate(190%)',
            color: isDark ? '#f7fafc' : '#1e293b',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: isDark
              ? '0 32px 80px -16px rgba(0, 0, 0, 0.75), inset 0 1px 1.5px rgba(255, 255, 255, 0.2)'
              : '0 32px 80px -16px rgba(15, 23, 42, 0.16), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: '22px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
          backgroundColor: 'transparent',
          flexShrink: 0,
        }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md relative overflow-hidden liquid-gloss transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, var(--theme-primary), var(--theme-primary-hover))`,
              boxShadow: `0 6px 20px -3px var(--theme-primary)`,
            }}
          >
            <Settings className="w-5 h-5 relative z-10" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
              {t.settings.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.settings.subtitle}
            </p>
          </div>
        </div>

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: isDark ? '#94a3b8' : '#64748b',
            borderRadius: '16px',
            p: 1.2,
            transition: 'all 0.2s ease-in-out',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.6)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.95)',
              color: isDark ? '#f8fafc' : '#0f172a',
              transform: 'scale(1.05)',
            },
          }}
        >
          <X className="w-5 h-5" />
        </IconButton>
      </DialogTitle>

      {/* Dialog Scrollable Body */}
      <DialogContent
        dividers={false}
        sx={{
          p: '26px 28px',
          overflowY: 'auto',
          backgroundColor: 'transparent',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
            borderRadius: '4px',
          },
        }}
      >
        <div className="space-y-6">
          {/* Section 1: Color Themes (ธีมสีหลัก) */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette
                className="w-4 h-4"
                style={{ color: 'var(--theme-primary)' }}
              />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.settings.colorTheme}
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                ({t.settings.colorThemeDesc})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(ACCENT_THEMES) as AccentColor[]).map((key) => {
                const item = ACCENT_THEMES[key];
                const isSelected = accentColor === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAccentColor(key)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 cursor-pointer group relative ${
                      isSelected
                        ? isDark
                          ? 'border-[rgba(255,255,255,0.4)] bg-white/10 shadow-lg ring-2'
                          : 'border-slate-400 bg-white/80 shadow-md ring-2'
                        : isDark
                        ? 'border-white/5 bg-white/[0.03] hover:bg-white/[0.08]'
                        : 'border-black/5 bg-white/40 hover:bg-white/70'
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: item.previewColor,
                            boxShadow: `0 8px 24px -4px ${item.previewColor}40, 0 0 0 2px ${item.previewColor}`,
                          }
                        : undefined
                    }
                  >
                    {/* Swatch circle with liquid gloss */}
                    <div
                      className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-md relative overflow-hidden liquid-gloss transition-transform duration-200 group-hover:scale-105"
                      style={{
                        backgroundColor: item.previewColor,
                        boxShadow: `0 4px 12px -2px ${item.previewColor}80`,
                      }}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3] relative z-10" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={language === 'th' ? item.name : item.nameEn}>
                        {language === 'th' ? item.name : item.nameEn}
                      </div>
                      {item.palette ? (
                        <div className="flex items-center gap-1 mt-1">
                          {item.palette.map((color, idx) => (
                            <span
                              key={idx}
                              className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/20 shadow-xs flex-shrink-0"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      ) : (
                        <div
                          className="text-[10px] font-semibold mt-0.5 truncate"
                          style={{ color: item.previewColor }}
                        >
                          {item.previewColor}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Font Family (รูปแบบฟอนต์) */}
          <section className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Type
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: 'var(--theme-primary)' }}
                />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {t.settings.fontFamily}
                </h3>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                  ({t.settings.fontFamilyDesc})
                </span>
              </div>

              {/* Action Buttons to Add Fonts */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFontTab(activeFontTab === 'google' ? 'none' : 'google');
                    setStatusMessage(null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    activeFontTab === 'google'
                      ? 'bg-sky-500 text-white shadow-sm ring-2 ring-sky-500/30'
                      : isDark
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20'
                      : 'bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-100'
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>{t.settings.addGoogleFontBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveFontTab(activeFontTab === 'upload' ? 'none' : 'upload');
                    setStatusMessage(null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    activeFontTab === 'upload'
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                      : isDark
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t.settings.uploadFontBtn}</span>
                </button>
              </div>
            </div>

            {/* Notification / Status Message */}
            {statusMessage && (
              <div
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all ${
                  statusMessage.type === 'success'
                    ? isDark
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : isDark
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusMessage(null)}
                  className="opacity-70 hover:opacity-100 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Expandable Panel 1: Google Font Adder */}
            {activeFontTab === 'google' && (
              <div
                className={`p-4 rounded-2xl border transition-all duration-200 space-y-3.5 ${
                  isDark
                    ? 'bg-sky-950/20 border-sky-500/30 shadow-inner'
                    : 'bg-sky-50/60 border-sky-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {t.settings.addGoogleFontTitle}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveFontTab('none')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Popular Thai Google Fonts Quick Chips */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {t.settings.popularFontsLabel}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_GOOGLE_FONTS.map((font) => {
                      const isAlreadyAdded = allFontOptions.some(
                        (f) => f.id.toLowerCase() === font.id.toLowerCase()
                      );
                      const isCurrentActive = fontFamily === font.id;
                      return (
                        <button
                          key={font.id}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            if (isAlreadyAdded) {
                              setFontFamily(font.id);
                            } else {
                              handleAddGoogleFont(font.id);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                            isCurrentActive
                              ? 'bg-sky-500 text-white font-bold shadow-sm'
                              : isAlreadyAdded
                              ? isDark
                                ? 'bg-white/10 text-slate-200 hover:bg-white/20'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                              : isDark
                              ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/25'
                              : 'bg-sky-100/80 text-sky-700 border border-sky-300 hover:bg-sky-200'
                          }`}
                        >
                          <span>{font.id}</span>
                          {isCurrentActive ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : !isAlreadyAdded ? (
                            <Plus className="w-2.5 h-2.5 text-sky-500" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input for Any Google Font Name */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddGoogleFont();
                  }}
                  className="flex gap-2 pt-1"
                >
                  <input
                    type="text"
                    value={googleFontInput}
                    onChange={(e) => setGoogleFontInput(e.target.value)}
                    placeholder={t.settings.googleFontPlaceholder}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-900/80 border-slate-700 text-slate-100 focus:border-sky-500'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-sky-500'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !googleFontInput.trim()}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                      isSubmitting || !googleFontInput.trim()
                        ? 'bg-slate-400 dark:bg-slate-700 opacity-60 cursor-not-allowed'
                        : 'bg-sky-500 hover:bg-sky-600 shadow-md active:scale-95'
                    }`}
                  >
                    {isSubmitting ? t.settings.loading : t.settings.addAndApplyBtn}
                  </button>
                </form>
              </div>
            )}

            {/* Expandable Panel 2: Upload Font File */}
            {activeFontTab === 'upload' && (
              <div
                className={`p-4 rounded-2xl border transition-all duration-200 space-y-3.5 ${
                  isDark
                    ? 'bg-emerald-950/20 border-emerald-500/30 shadow-inner'
                    : 'bg-emerald-50/60 border-emerald-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileUp className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {t.settings.uploadFontTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.settings.uploadFontDesc}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveFontTab('none')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={customFontNameInput}
                    onChange={(e) => setCustomFontNameInput(e.target.value)}
                    placeholder={t.settings.fontNamePlaceholder}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-900/80 border-slate-700 text-slate-100 focus:border-emerald-500'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                    }`}
                  />

                  {/* Hidden native input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Drag / Click Upload Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 ${
                      isDark
                        ? 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10'
                        : 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-100/60'
                    }`}
                  >
                    <Upload className="w-6 h-6 mx-auto mb-1.5 text-emerald-500 animate-bounce" />
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t.settings.uploadDropzone}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t.settings.uploadFormats}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* List of Available Fonts (Presets + Custom Added) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allFontOptions.map((font) => {
                const isSelected = fontFamily === font.id;
                const isCustom = font.source === 'google' || font.source === 'custom';

                return (
                  <div
                    key={font.id}
                    onClick={() => setFontFamily(font.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group relative ${
                      isSelected
                        ? isDark
                          ? 'border-[rgba(255,255,255,0.4)] bg-white/10 shadow-lg ring-2'
                          : 'border-slate-400 bg-white/80 shadow-md ring-2'
                        : isDark
                        ? 'border-white/5 bg-white/[0.03] hover:bg-white/[0.08]'
                        : 'border-black/5 bg-white/40 hover:bg-white/70'
                    }`}
                    style={{
                      fontFamily: `"${font.id}", sans-serif`,
                      ...(isSelected
                        ? {
                            borderColor: currentAccent.previewColor,
                            boxShadow: `0 0 0 2px ${currentAccent.previewColor}55`,
                          }
                        : {}),
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {font.label}
                        </div>
                        {font.source === 'google' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-sky-500/15 text-sky-500 dark:text-sky-400 border border-sky-500/25">
                            Google Font
                          </span>
                        )}
                        {font.source === 'custom' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                            Local {formatFileSize(font.fileSize)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {font.sample}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Delete Custom Font Button */}
                      {isCustom && (
                        <button
                          type="button"
                          title={t.settings.deleteFontTitle}
                          onClick={(e) => handleDeleteCustomFont(e, font.id, font.label)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Selection Radio / Checkmark */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'text-white'
                            : 'border border-slate-300 dark:border-slate-600'
                        }`}
                        style={
                          isSelected
                            ? { backgroundColor: currentAccent.previewColor }
                            : undefined
                        }
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 3: Language Settings (ภาษา) */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe
                className="w-4 h-4"
                style={{ color: 'var(--theme-primary)' }}
              />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.settings.language}
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                ({t.settings.languageDesc})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Thai */}
              <button
                type="button"
                onClick={() => setLanguage('th')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                  language === 'th'
                    ? isDark
                      ? 'border-[rgba(255,255,255,0.4)] bg-white/10 shadow-lg ring-2'
                      : 'border-slate-400 bg-white/80 shadow-md ring-2'
                    : isDark
                    ? 'border-white/5 bg-white/[0.03] hover:bg-white/[0.08]'
                    : 'border-black/5 bg-white/40 hover:bg-white/70'
                }`}
                style={
                  language === 'th'
                    ? {
                        borderColor: currentAccent.previewColor,
                        boxShadow: `0 8px 24px -4px ${currentAccent.previewColor}40, 0 0 0 2px ${currentAccent.previewColor}`,
                      }
                    : undefined
                }
              >
                <div className="text-2xl flex-shrink-0">🇹🇭</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    ภาษาไทย
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">Thai (TH)</div>
                </div>
                {language === 'th' && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: currentAccent.previewColor }}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* English */}
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                  language === 'en'
                    ? isDark
                      ? 'border-[rgba(255,255,255,0.4)] bg-white/10 shadow-lg ring-2'
                      : 'border-slate-400 bg-white/80 shadow-md ring-2'
                    : isDark
                    ? 'border-white/5 bg-white/[0.03] hover:bg-white/[0.08]'
                    : 'border-black/5 bg-white/40 hover:bg-white/70'
                }`}
                style={
                  language === 'en'
                    ? {
                        borderColor: currentAccent.previewColor,
                        boxShadow: `0 8px 24px -4px ${currentAccent.previewColor}40, 0 0 0 2px ${currentAccent.previewColor}`,
                      }
                    : undefined
                }
              >
                <div className="text-2xl flex-shrink-0">🇺🇸</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    English
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">English (US)</div>
                </div>
                {language === 'en' && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: currentAccent.previewColor }}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>
          </section>

          {/* Section 4: Live Preview Box */}
          <section
            className={`p-4 rounded-2xl border space-y-3 transition-colors ${
              isDark
                ? 'bg-white/[0.04] border-white/10 shadow-inner'
                : 'bg-white/60 border-black/5 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles
                  className="w-3.5 h-3.5"
                  style={{ color: 'var(--theme-primary)' }}
                />
                {t.settings.preview}
              </span>
              <span className="font-mono text-[11px] opacity-75">
                {fontFamily} • {currentAccent.nameEn} • {language.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Sample Button */}
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md relative overflow-hidden liquid-gloss transition-all active:scale-95"
                style={{
                  background: `linear-gradient(135deg, var(--theme-primary), var(--theme-primary-hover))`,
                }}
              >
                {t.common.confirm}
              </button>

              {/* Sample Badge */}
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold border transition-all"
                style={{
                  backgroundColor: 'var(--theme-primary-light)',
                  color: 'var(--theme-primary-text)',
                  borderColor: 'var(--theme-primary-border)',
                }}
              >
                {t.common.appName} {t.common.version}
              </span>

              {/* Sample Text */}
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.settings.previewText}
              </span>
            </div>
          </section>
        </div>
      </DialogContent>

      {/* Dialog Footer Actions */}
      <DialogActions
        sx={{
          p: '18px 28px',
          borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition hover:bg-white/10 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.settings.resetDefaults}</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md relative overflow-hidden liquid-gloss transition active:scale-95 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, var(--theme-primary), var(--theme-primary-hover))`,
            boxShadow: `0 6px 20px -3px var(--theme-primary)`,
          }}
        >
          {t.common.save} / {t.settings.close}
        </button>
      </DialogActions>
    </Dialog>
  );
};
