import React from 'react';

interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  variant?: 'default' | 'highlight';
  className?: string;
}

export function SummaryCard({
  label,
  value,
  variant = 'default',
  className = '',
}: SummaryCardProps) {
  const variantClasses = {
    default: 'bg-white p-5 rounded-xl border border-gray-200 shadow-sm',
    highlight:
      'bg-aid-green/10 border border-aid-green/30 rounded-xl p-5',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      <p className="text-xs font-heading font-bold text-gray-500 mb-2">
        {label}
      </p>
      <div className="font-heading font-bold text-aid-dark">{value}</div>
    </div>
  );
}

export default SummaryCard;
