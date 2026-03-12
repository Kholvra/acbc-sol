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
    default: 'bg-white/40 p-5 rounded-2xl border border-white/60 shadow-sm',
    highlight:
      'bg-aid-green/10 border-2 border-aid-green/20 rounded-[24px] p-6 shadow-lg shadow-aid-green/5',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      <p className="text-[10px] font-heading font-black text-aid-dark/30 mb-2 uppercase tracking-[0.2em]">
        {label}
      </p>
      <div className="font-heading font-black text-aid-dark">{value}</div>
    </div>
  );
}

export default SummaryCard;
