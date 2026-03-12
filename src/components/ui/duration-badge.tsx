import React from 'react';
import { Clock } from 'lucide-react';

interface DurationBadgeProps {
  days: number;
  label?: string;
  className?: string;
}

export function DurationBadge({ days, label = 'Duration', className = '' }: DurationBadgeProps) {
  if (days <= 0) return null;

  return (
    <div className={`inline-flex items-center gap-2 text-sm font-heading font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-full ${className}`}>
      <Clock className="w-4 h-4 text-aid-green" />
      {label}:{' '}
      <span className="text-aid-dark">{days} days</span>
    </div>
  );
}

export default DurationBadge;
