import React from 'react';
import { TextField as MuiTextField, type TextFieldProps } from '@mui/material';

export type PosInputProps = TextFieldProps & {
  outsideLabel?: boolean;
  labelRight?: React.ReactNode;
};

export const PosInput: React.FC<PosInputProps> = ({
  sx,
  slotProps,
  label,
  outsideLabel = false,
  labelRight,
  required,
  fullWidth = true,
  ...props
}) => {
  const inputElement = (
    <MuiTextField
      size="medium"
      variant="outlined"
      fullWidth={fullWidth}
      required={required}
      label={outsideLabel ? undefined : label}
      slotProps={{
        ...slotProps,
        inputLabel: {
          shrink: true,
          ...slotProps?.inputLabel,
        },
      }}
      sx={{
        '& .MuiInputLabel-root': {
          fontSize: '0.875rem',
          fontWeight: 600,
          color: (theme) => theme.palette.mode === 'dark' ? '#a0aec0' : '#718096',
          transform: 'translate(14px, -9px) scale(0.85)',
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1a202c' : '#ffffff',
          padding: '0 6px',
          zIndex: 1,
          '&.Mui-focused': {
            color: 'var(--theme-primary, #5b8a72)',
          },
        },
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(30, 37, 51, 0.65)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(14px)',
          color: (theme) => (theme.palette.mode === 'dark' ? '#f7fafc' : '#2d3748'),
          fontSize: '0.925rem',
          fontWeight: 500,
          minHeight: '48px',
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
          '& .MuiOutlinedInput-input': {
            padding: '12px 16px',
            boxSizing: 'border-box',
            '&.MuiInputBase-inputAdornedStart': {
              paddingLeft: 0,
            },
            '&.MuiInputBase-inputAdornedEnd': {
              paddingRight: 0,
            },
          },
        },
        ...sx,
      }}
      {...props}
    />
  );

  if (outsideLabel && (label || labelRight)) {
    const isString = typeof label === 'string';
    const hasAsterisk = isString && label.trim().endsWith('*');
    const cleanLabel = isString && required && hasAsterisk ? label.replace(/\s*\*+$/, '') : label;

    return (
      <div className={fullWidth ? 'w-full' : 'inline-block'}>
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {cleanLabel}
              {required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
          )}
          {labelRight}
        </div>
        {inputElement}
      </div>
    );
  }

  return inputElement;
};
