'use client';

import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { cn } from '~/lib/cn';

interface FormCurrencyInputProps<T extends FieldValues = FieldValues> {
  label: string;
  placeholder?: string;
  error?: string;
  className?: string;
  control?: Control<T>;
  name: FieldPath<T>;
}

export function FormCurrencyInput<T extends FieldValues = FieldValues>({
  label,
  placeholder = '0',
  error,
  className = '',
  control,
  name,
}: FormCurrencyInputProps<T>) {
  const {
    field,
    fieldState: { error: fieldError },
  } = useController({
    name,
    control,
    rules: { required: 'Price is required' },
    defaultValue: 0 as T[FieldPath<T>],
  });

  const formatNumber = (num: number): string => {
    if (!num && num !== 0) return '';
    return num.toLocaleString('id-ID');
  };

  const parseNumber = (value: string): number => {
    const cleaned = value.replace(/\./g, '');
    return parseInt(cleaned, 10) || 0;
  };

  const displayValue = formatNumber(field.value as number);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue, 10) || 0;
    field.onChange(numValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    field.onBlur();
  };

  const labelClasses = 'block text-xs font-heading font-bold text-gray-600 mb-2';
  const errorClasses =
    'text-red-500 text-xs mt-2 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1';

  const inputClasses = cn(
    'w-full bg-gray-50 border rounded-xl px-4 py-3 text-aid-dark font-medium outline-none transition-all duration-200 text-right font-bold',
    'hover:border-gray-300 hover:bg-gray-100',
    'focus:bg-white focus:border-aid-green focus:ring-2 focus:ring-aid-green/20',
    fieldError
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
          ref={field.ref}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          name={field.name}
          className={`${inputClasses} pl-10`}
        />
      </div>
      {(error ?? fieldError?.message) && (
        <p className={errorClasses}>
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {error ?? fieldError?.message}
        </p>
      )}
    </div>
  );
}

export default FormCurrencyInput;