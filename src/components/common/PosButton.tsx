import React from 'react';
import { Button as MuiButton, type ButtonProps } from '@mui/material';

interface PosButtonProps extends Omit<ButtonProps, 'color'> {
  variantStyle?: 'primary' | 'secondary' | 'outline' | 'danger';
  children: React.ReactNode;
}

export const PosButton: React.FC<PosButtonProps> = ({
  variantStyle = 'primary',
  children,
  sx,
  ...props
}) => {
  const getCustomStyles = () => {
    switch (variantStyle) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, var(--theme-primary, #5b8a72), var(--theme-primary-hover, #4d7863))',
          color: '#ffffff',
          fontWeight: 600,
          boxShadow: '0 6px 20px -4px var(--theme-primary-border, rgba(91, 138, 114, 0.3)), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:hover': {
            boxShadow: '0 8px 24px -2px var(--theme-primary-border, rgba(91, 138, 114, 0.45)), inset 0 1px 1px rgba(255, 255, 255, 0.65)',
            transform: 'translateY(-1px)',
          },
        };
      case 'secondary':
        return {
          backgroundColor: 'rgba(245, 244, 239, 0.85)',
          color: '#4a5568',
          fontWeight: 600,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(235, 231, 223, 0.7)',
          '&:hover': {
            backgroundColor: 'rgba(236, 234, 226, 0.95)',
            color: '#2d3748',
            transform: 'translateY(-1px)',
          },
        };
      case 'outline':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid rgba(235, 231, 223, 0.9)',
          color: '#4a5568',
          fontWeight: 600,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
          '&:hover': {
            borderColor: 'var(--theme-primary, #5b8a72)',
            backgroundColor: '#ffffff',
            color: 'var(--theme-primary, #5b8a72)',
            transform: 'translateY(-1px)',
          },
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #f87171, #ef4444)',
          color: '#ffffff',
          fontWeight: 600,
          boxShadow: '0 6px 20px -4px rgba(239, 68, 68, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:hover': {
            backgroundColor: '#dc2626',
            boxShadow: '0 8px 24px -2px rgba(239, 68, 68, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.65)',
            transform: 'translateY(-1px)',
          },
        };
      default:
        return {};
    }
  };

  return (
    <MuiButton
      variant="contained"
      sx={{
        borderRadius: '16px',
        textTransform: 'none',
        padding: '10px 20px',
        minHeight: '44px',
        fontSize: '0.875rem',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:active': { transform: 'scale(0.97)' },
        ...getCustomStyles(),
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
