import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
  register?: UseFormRegisterReturn;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string;
}

export function FormSelect({
  label,
  options,
  placeholder = 'Select option',
  error,
  className = '',
  register,
  onChange,
  value,
}: FormSelectProps) {
  const baseSelectClasses = `w-full bg-gray-50 border rounded-xl px-4 py-3 text-aid-dark font-medium appearance-none focus:bg-white outline-none transition-all cursor-pointer ${
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/30'
      : 'border-gray-200 focus:border-aid-green focus:ring-2 focus:ring-aid-green/20'
  } ${className}`;

  const labelClasses =
    'block text-xs font-heading font-bold text-gray-600 mb-2';

  const errorClasses =
    'text-red-500 text-xs mt-2 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1';

  return (
    <div className="group">
      <label className={labelClasses}>
        {label}
      </label>
      <div className="relative">
        <select
          className={baseSelectClasses}
          value={value}
          {...(register ?? {})}
          {...(onChange ? { onChange } : {})}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className={errorClasses}>
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {error}
        </p>
      )}
    </div>
  );
}

export default FormSelect;
