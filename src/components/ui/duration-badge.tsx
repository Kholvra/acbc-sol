import React from 'react';

interface DurationBadgeProps {
  days: number;
  label?: string;
  className?: string;
}

export function DurationBadge({ days, label = 'Duration', className = '' }: DurationBadgeProps) {
  if (days <= 0) return null;

  return (
    <div className={`flex items-center gap-2 text-sm font-heading font-black text-aid-dark/40 uppercase tracking-widest bg-aid-dark/[0.03] w-fit px-4 py-2 rounded-xl ${className}`}>
      {label}:{' '}
      <span className="text-aid-green">{days} days</span>
    </div>
  );
}

export default DurationBadge;
