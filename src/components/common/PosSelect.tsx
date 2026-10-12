import React, { useState, useRef, useMemo } from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  type SelectProps,
  ListSubheader,
  MenuItem,
} from '@mui/material';
import { Search, X } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export type PosSelectProps = SelectProps & {
  label?: React.ReactNode;
  outsideLabel?: boolean;
  labelRight?: React.ReactNode;
  required?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  noMatchesText?: string;
  children?: React.ReactNode;
};

// Helper function to extract searchable plain text from React nodes
const extractNodeText = (node: React.ReactNode): string => {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractNodeText).join(' ');
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode; value?: unknown };
    const childrenText = extractNodeText(props.children);
    const valueText = typeof props.value === 'string' ? props.value : '';
    return `${childrenText} ${valueText}`.trim();
  }
  return '';
};

export const PosSelect: React.FC<PosSelectProps> = ({
  label,
  outsideLabel = false,
  labelRight,
  required = false,
  searchable = false,
  searchPlaceholder,
  noMatchesText,
  children,
  sx,
  MenuProps,
  onClose,
  size,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  let language = 'th';
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const pos = usePos();
    if (pos?.language) {
      language = pos.language;
    }
  } catch {
    // Fallback if rendered outside PosProvider
  }

  // Filter children based on search term when searchable is enabled
  const filteredChildren = useMemo(() => {
    if (!searchable || !searchTerm.trim()) {
      return children;
    }

    const q = searchTerm.trim().toLowerCase();
    const childArray = React.Children.toArray(children);

    return childArray.filter((child) => {
      const text = extractNodeText(child).toLowerCase();
      return text.includes(q);
    });
  }, [searchable, searchTerm, children]);

  const hasNoMatches =
    searchable &&
    searchTerm.trim().length > 0 &&
    React.Children.count(filteredChildren) === 0;

  const handleMenuClose = (event: React.SyntheticEvent) => {
    setSearchTerm('');
    onClose?.(event);
  };

  const isSmall = size === 'small';

  const selectElement = (
    <FormControl fullWidth size={size || 'small'} required={required}>
      {!outsideLabel && label && (
        <InputLabel
          shrink
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: (theme) => (theme.palette.mode === 'dark' ? '#a0aec0' : '#718096'),
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1a202c' : '#ffffff'),
            padding: '0 6px',
            transform: 'translate(14px, -9px) scale(0.85)',
            zIndex: 1,
            '&.Mui-focused': {
              color: 'var(--theme-primary, #5b8a72)',
            },
          }}
        >
          {label}
        </InputLabel>
      )}
      <MuiSelect
        displayEmpty
        size={size}
        label={outsideLabel ? undefined : (typeof label === 'string' ? label : undefined)}
        onClose={handleMenuClose}
        MenuProps={{
          autoFocus: false,
          disableAutoFocusItem: true,
          onTransitionEnter: () => {
            if (searchable) {
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 50);
            }
          },
          sx: {
            '& .MuiPaper-root': {
              borderRadius: '12px',
              maxHeight: '380px',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? '#151922' : '#ffffff',
              border: (theme) =>
                theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.08)'
                  : '1px solid #ebe7df',
              boxShadow: '0 20px 45px -12px rgba(0, 0, 0, 0.25)',
            },
            '& .MuiList-root': {
              pt: 0,
            },
            ...MenuProps?.sx,
          },
          ...MenuProps,
        }}
        sx={{
          borderRadius: '12px',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(30, 37, 51, 0.65)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(14px)',
          color: (theme) => (theme.palette.mode === 'dark' ? '#f7fafc' : '#2d3748'),
          fontSize: isSmall ? '0.8125rem' : '0.875rem',
          fontWeight: 500,
          minHeight: isSmall ? '38px' : '48px',
          height: isSmall ? '38px' : undefined,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? 'inset 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 1px rgba(255, 255, 255, 0.05)'
              : 'inset 0 1px 2px rgba(0, 0, 0, 0.02), 0 1px 1px rgba(255, 255, 255, 0.9)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '& fieldset': {
            top: 0,
            padding: 0,
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(235, 231, 223, 0.85)',
            legend: {
              display: 'none',
            },
          },
          '&:hover fieldset': {
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#d5d0c6',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px var(--theme-primary-light, rgba(91, 138, 114, 0.18))',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'var(--theme-primary, #5b8a72)',
            borderWidth: '1.5px',
          },
          '& .MuiSelect-select': {
            padding: isSmall ? '0 12px' : '10px 14px',
            height: isSmall ? '38px !important' : undefined,
            minHeight: isSmall ? '38px !important' : undefined,
            display: isSmall ? 'flex' : undefined,
            alignItems: isSmall ? 'center' : undefined,
            boxSizing: 'border-box',
          },
          ...sx,
        }}
        {...props}
      >
        {searchable && (
          <ListSubheader
            disableSticky={false}
            sx={{
              p: 1.5,
              lineHeight: 'normal',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? '#18202e' : '#ffffff',
              borderBottom: (theme) =>
                theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.08)'
                  : '1px solid #ebe7df',
              zIndex: 2,
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          >
            <div
              className="relative w-full flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                }}
                placeholder={
                  searchPlaceholder ||
                  (language === 'th' ? 'พิมพ์เพื่อค้นหา...' : 'Type to search...')
                }
                className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </ListSubheader>
        )}
        {hasNoMatches ? (
          <MenuItem
            disabled
            sx={{
              justifyContent: 'center',
              py: 2.5,
              fontSize: '0.813rem',
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
          >
            {noMatchesText ||
              (language === 'th'
                ? `ไม่พบตัวเลือกที่ตรงกับ "${searchTerm}"`
                : `No matches found for "${searchTerm}"`)}
          </MenuItem>
        ) : (
          filteredChildren
        )}
      </MuiSelect>
    </FormControl>
  );

  if (outsideLabel && (label || labelRight)) {
    const isString = typeof label === 'string';
    const hasAsterisk = isString && label.trim().endsWith('*');
    const cleanLabel = isString && required && hasAsterisk ? label.replace(/\s*\*+$/, '') : label;

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {cleanLabel}
              {required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
          )}
          {labelRight}
        </div>
        {selectElement}
      </div>
    );
  }

  return selectElement;
};
