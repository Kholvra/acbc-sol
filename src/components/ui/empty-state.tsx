import React from 'react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  title = 'No Data',
  description = 'There is no data available at the moment.',
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  const defaultIcon = (
    <svg
      className="w-12 h-12 text-aid-dark/20 mx-auto mb-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  return (
    <div
      className={`text-center py-12 text-aid-dark/30 border-2 border-dashed border-aid-dark/5 rounded-[24px] bg-aid-dark/[0.02] ${className}`}
    >
      {icon ?? defaultIcon}
      {title && (
        <p className="font-heading font-bold text-aid-dark/50 mb-2">{title}</p>
      )}
      {description && (
        <p className="text-sm font-medium text-aid-dark/30">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 text-xs bg-aid-dark hover:bg-aid-green text-white font-black px-6 py-3 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-aid-dark/10 hover:shadow-aid-green/20 hover:scale-[1.02] active:scale-95 tracking-widest uppercase mx-auto"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
