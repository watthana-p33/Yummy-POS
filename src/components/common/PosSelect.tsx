import React from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  type SelectProps,
} from '@mui/material';

export type PosSelectProps = SelectProps & {
  label?: string;
  children?: React.ReactNode;
};

export const PosSelect: React.FC<PosSelectProps> = ({
  label,
  children,
  sx,
  ...props
}) => {
  return (
    <FormControl fullWidth size="small">
      {label && (
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
        sx={{
          borderRadius: '16px',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(30, 37, 51, 0.65)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(14px)',
          color: (theme) => (theme.palette.mode === 'dark' ? '#f7fafc' : '#2d3748'),
          fontSize: '0.875rem',
          fontWeight: 500,
          minHeight: '44px',
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
            padding: '10px 14px',
          },
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiSelect>
    </FormControl>
  );
};
