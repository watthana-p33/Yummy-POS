import React from 'react';
import { Card as MuiCard, type CardProps } from '@mui/material';

interface PosCardProps extends CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const PosCard: React.FC<PosCardProps> = ({
  children,
  className = '',
  hoverable = false,
  sx,
  ...props
}) => {
  return (
    <MuiCard
      elevation={0}
      className={`liquid-glass-panel ${className}`.trim()}
      sx={{
        borderRadius: '12px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(hoverable && {
          '&:hover': {
            borderColor: 'var(--theme-primary, #5b8a72) !important',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 16px 40px -4px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15) !important'
                : '0 16px 40px -4px var(--theme-primary-border, rgba(91, 138, 114, 0.2)), inset 0 1px 1px rgba(255, 255, 255, 1) !important',
            transform: 'translateY(-2px)',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiCard>
  );
};
