import React from 'react';

export interface PageHeaderProps {
  /** Icon displayed in the liquid-gloss gradient badge */
  icon: React.ReactNode;
  /** Main title text or element */
  title: React.ReactNode;
  /** Subtitle description below the title */
  subtitle?: React.ReactNode;
  /** Action buttons or controls aligned on the right side */
  actions?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  subtitle,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <span
            className="p-2.5 rounded-2xl text-white shadow-md relative overflow-hidden liquid-gloss shrink-0"
            style={{
              background: `linear-gradient(135deg, var(--theme-primary), var(--theme-primary-hover))`,
              boxShadow: `0 6px 18px -3px var(--theme-primary)`,
            }}
          >
            {icon}
          </span>
          <span>{title}</span>
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex-1 p-4 md:p-6 lg:p-8 space-y-6 min-h-screen bg-transparent w-full ${className}`}>
      {children}
    </div>
  );
};
