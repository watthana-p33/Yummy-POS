import React from 'react';

export interface PosLabelActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Reusable action/link button for field labels (e.g. inside labelRight of PosInput or PosSelect)
 */
export const PosLabelAction: React.FC<PosLabelActionProps> = ({
  icon,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer transition active:scale-95 select-none ${className}`}
      {...props}
    >
      {icon}
      {children && <span>{children}</span>}
    </button>
  );
};

export const LabelActionButton = PosLabelAction;
