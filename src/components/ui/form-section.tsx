import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  accentColor?: 'green' | 'yellow' | 'dark';
  className?: string;
}

const accentColorMap = {
  green: 'bg-aid-green shadow-[0_0_10px_rgba(187,200,99,0.3)]',
  yellow: 'bg-aid-yellow shadow-[0_0_10px_rgba(240,228,145,0.4)]',
  dark: 'bg-aid-dark shadow-[0_0_10px_rgba(101,140,88,0.3)]',
} as const;

export function FormSection({
  title,
  children,
  accentColor = 'green',
  className = '',
}: FormSectionProps) {
  return (
    <div className={`rounded-3xl p-8 bg-white border border-gray-200 shadow-sm ${className}`}>
      <h3 className="text-xl font-heading font-black text-aid-dark mb-8 flex items-center gap-3">
        <span className={`w-2 h-6 rounded-full ${accentColorMap[accentColor]}`} />
        {title}
      </h3>
      {children}
    </div>
  );
}

export default FormSection;
