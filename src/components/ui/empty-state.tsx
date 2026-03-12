import React from 'react';
import { Package } from 'lucide-react';
import Button from './button';

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
  const defaultIcon = <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />;

  return (
    <div
      className={`text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 ${className}`}
    >
      {icon ?? defaultIcon}
      {title && (
        <p className="font-heading font-bold text-gray-600 mb-2">{title}</p>
      )}
      {description && (
        <p className="text-sm text-gray-400">{description}</p>
      )}
      {action && (
        <Button
          type="button"
          onClick={action.onClick}
          variant="primary"
          size="md"
          className="mt-4 mx-auto"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
