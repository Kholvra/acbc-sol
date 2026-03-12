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
  const baseSelectClasses = `w-full bg-white/40 border-2 border-aid-dark/5 rounded-2xl px-5 py-4 text-aid-dark font-medium appearance-none focus:border-aid-green/50 focus:bg-white/80 outline-none transition-all shadow-sm cursor-pointer ${className}`;

  const labelClasses =
    'block text-[10px] font-heading font-black text-aid-dark/40 mb-2 uppercase tracking-[0.2em] transition-colors group-focus-within:text-aid-green';

  const errorClasses =
    'text-red-500 text-xs mt-2 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-1';

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
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-aid-dark/30">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className={errorClasses}>
          <span className="w-1 h-1 bg-red-500 rounded-full" /> {error}
        </p>
      )}
    </div>
  );
}

export default FormSelect;
