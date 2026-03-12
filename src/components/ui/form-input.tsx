import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps {
  label: string;
  type?: 'text' | 'number' | 'date' | 'textarea';
  placeholder?: string;
  error?: string;
  prefix?: string;
  rows?: number;
  min?: string;
  className?: string;
  register?: UseFormRegisterReturn;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  value?: string | number;
}

export function FormInput({
  label,
  type = 'text',
  placeholder,
  error,
  prefix,
  rows = 3,
  min,
  className = '',
  register,
  onChange,
  value,
}: FormInputProps) {
  const baseInputClasses = `w-full bg-gray-50 border rounded-xl px-4 py-3 text-aid-dark font-medium placeholder:text-gray-400 focus:bg-white outline-none transition-all ${
    type === 'number' ? 'text-right font-bold' : ''
  } ${
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/30'
      : 'border-gray-200 focus:border-aid-green focus:ring-2 focus:ring-aid-green/20'
  } ${className}`;

  const labelClasses =
    'block text-xs font-heading font-bold text-gray-600 mb-2';

  const errorClasses =
    'text-red-500 text-xs mt-2 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1';

  const renderInput = () => {
    const props = {
      className: baseInputClasses,
      placeholder,
      min,
      onChange,
      value,
      ...(register ?? {}),
    };

    if (type === 'textarea') {
      return (
        <textarea
          {...props}
          rows={rows}
          className={`${baseInputClasses} resize-none`}
        />
      );
    }

    if (type === 'number' && prefix) {
      return (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
            {prefix}
          </span>
          <input {...props} type={type} className={`${baseInputClasses} pl-10`} />
        </div>
      );
    }

    return <input {...props} type={type} />;
  };

  return (
    <div className="group">
      <label className={labelClasses}>
        {label}
      </label>
      {renderInput()}
      {error && (
        <p className={errorClasses}>
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {error}
        </p>
      )}
    </div>
  );
}

export default FormInput;
