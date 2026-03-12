'use client';

import { useState, useEffect, useRef } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '~/lib/cn';

interface FormCurrencyInputProps {
  label: string;
  placeholder?: string;
  error?: string;
  className?: string;
  register?: UseFormRegisterReturn;
  value?: number | string;
}

export function FormCurrencyInput({
  label,
  placeholder = '0',
  error,
  className = '',
  register,
  value,
}: FormCurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine refs when component mounts
  useEffect(() => {
    if (inputRef.current && register?.ref) {
      if (typeof register.ref === 'function') {
        register.ref(inputRef.current);
      } else {
        register.ref.current = inputRef.current;
      }
    }
  }, [register?.ref]);

  // Format number to IDR format (e.g., 1000000 -> 1.000.000)
  const formatNumber = (num: number): string => {
    if (!num && num !== 0) return '';
    return num.toLocaleString('id-ID');
  };

  // Ensure we always have a numeric value for display
  // IMPORTANT: Remove dots (thousands separator) before parsing Indonesian format
  const numericValue = value !== undefined && value !== null && value !== ''
    ? (typeof value === 'string' ? parseFloat(value.replace(/\./g, '')) || 0 : value)
    : 0;

  const [displayValue, setDisplayValue] = useState(() => formatNumber(numericValue));

  // Sync external value changes (from react-hook-form)
  // Only update if the value is significantly different from what's displayed
  useEffect(() => {
    const expectedFormatted = formatNumber(numericValue);

    // Only update if the formatted value is different
    // This prevents re-render loops and interference during typing
    if (displayValue !== expectedFormatted) {
      setDisplayValue(expectedFormatted);
    }
    // Intentionally not including displayValue in deps to avoid update loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue, 10) || 0;
    const formatted = formatNumber(numValue);

    setDisplayValue(formatted);

    // Create synthetic event with raw value for react-hook-form
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: register?.name ?? '',
        value: numValue,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    void register?.onChange?.(syntheticEvent);
  };

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    await register?.onBlur?.(e);
  };

  const labelClasses = 'block text-xs font-heading font-bold text-gray-600 mb-2';
  const errorClasses =
    'text-red-500 text-xs mt-2 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1';

  const inputClasses = cn(
    'w-full bg-gray-50 border rounded-xl px-4 py-3 text-aid-dark font-medium outline-none transition-all duration-200 text-right font-bold',
    'hover:border-gray-300 hover:bg-gray-100',
    'focus:bg-white focus:border-aid-green focus:ring-2 focus:ring-aid-green/20',
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/50 hover:bg-red-50/70'
      : 'border-gray-200',
    className
  );

  return (
    <div className="group">
      <label className={labelClasses}>{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
          Rp
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          name={register?.name}
          className={`${inputClasses} pl-10`}
        />
      </div>
      {error && (
        <p className={errorClasses}>
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {error}
        </p>
      )}
    </div>
  );
}

export default FormCurrencyInput;
