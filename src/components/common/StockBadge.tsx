import React from 'react';
import { Chip as MuiChip, Tooltip, type ChipProps } from '@mui/material';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { usePos } from '../../context/PosContext';

interface StockBadgeProps extends Omit<ChipProps, 'color'> {
  stock: number;
  iconOnly?: boolean;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ stock, iconOnly = false, sx, ...props }) => {
  const { t, themeMode } = usePos();
  const isDark = themeMode === 'dark';

  if (iconOnly) {
    if (stock > 10) {
      return (
        <Tooltip title={(t?.stockBadge?.inStockTooltip || 'พร้อมจำหน่าย ({stock} ชิ้น)').replace('{stock}', String(stock))} arrow placement="top">
          <span
            className="inline-flex items-center justify-center w-3 h-3 rounded-xl transition-transform hover:scale-110 cursor-help"
            style={{
              backgroundColor: '#387258',
              color: '#387258',
              borderRadius: '59% 41% 55% 45% / 51% 53% 47% 49% ',
            }}
          />
        </Tooltip>
      );
    }

    if (stock > 0) {
      return (
        <Tooltip title={(t?.stockBadge?.lowStockTooltip || 'สินค้าใกล้หมด (เหลือ {stock} ชิ้น)').replace('{stock}', String(stock))} arrow placement="top">
          <span
            className="inline-flex items-center justify-center w-3 h-3 rounded-xl transition-transform hover:scale-110 cursor-help"
            style={{
              backgroundColor: isDark ? '#f59e0b' : '#d97706',
              color: isDark ? '#f59e0b' : '#d97706',
              borderRadius: '59% 41% 55% 45% / 51% 53% 47% 49% ',
            }}
          />
        </Tooltip>
      );
    }

    return (
      <Tooltip title={t?.stockBadge?.outOfStockTooltip || 'สินค้าหมด'} arrow placement="top">
        <span
          className="inline-flex items-center justify-center w-3 h-3 rounded-xl transition-transform hover:scale-110 cursor-help"
          style={{
            backgroundColor: isDark ? '#f87171' : '#ef4444',
            color: isDark ? '#f87171' : '#ef4444',
            borderRadius: '59% 41% 55% 45% / 51% 53% 47% 49%',
          }}
        />
      </Tooltip>
    );
  }

  if (stock > 10) {
    return (
      <MuiChip
        size="small"
        icon={<CheckCircle style={{ width: 14, height: 14, color: 'var(--theme-primary-text, #387258)' }} />}
        label={(t?.stockBadge?.inStockLabel || 'พร้อมขาย ({stock})').replace('{stock}', String(stock))}
        sx={{
          backgroundColor: 'var(--theme-primary-light, #eaf4ee)',
          color: 'var(--theme-primary-text, #387258)',
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: '12px',
          border: '1px solid var(--theme-primary-border, #c9e4d5)',
          backdropFilter: 'blur(8px)',
          boxShadow: isDark ? 'none' : 'inset 0 1px 1px rgba(255, 255, 255, 0.7)',
          ...sx,
        }}
        {...props}
      />
    );
  }

  if (stock > 0) {
    return (
      <MuiChip
        size="small"
        icon={<AlertTriangle style={{ width: 14, height: 14, color: isDark ? '#fbbf24' : '#a06214' }} />}
        label={(t?.stockBadge?.lowStockLabel || 'ใกล้หมด ({stock})').replace('{stock}', String(stock))}
        sx={{
          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(254, 247, 230, 0.85)',
          color: isDark ? '#fbbf24' : '#a06214',
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: '12px',
          border: isDark ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(249, 226, 177, 0.9)',
          backdropFilter: 'blur(8px)',
          boxShadow: isDark ? 'none' : 'inset 0 1px 1px rgba(255, 255, 255, 0.7)',
          ...sx,
        }}
        {...props}
      />
    );
  }

  return (
    <MuiChip
      size="small"
      icon={<XCircle style={{ width: 14, height: 14, color: isDark ? '#f87171' : '#b54545' }} />}
      label={t?.stockBadge?.outOfStockLabel || 'สินค้าหมด'}
      sx={{
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(253, 240, 240, 0.85)',
        color: isDark ? '#f87171' : '#b54545',
        fontWeight: 600,
        fontSize: '0.75rem',
        borderRadius: '12px',
        border: isDark ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(247, 206, 206, 0.9)',
        backdropFilter: 'blur(8px)',
        boxShadow: isDark ? 'none' : 'inset 0 1px 1px rgba(255, 255, 255, 0.7)',
        ...sx,
      }}
      {...props}
    />
  );
};
