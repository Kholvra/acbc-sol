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
  rows = 2,
  min,
  className = '',
  register,
  onChange,
  value,
}: FormInputProps) {
  const baseInputClasses = `w-full bg-white/40 border-2 border-aid-dark/5 rounded-2xl px-5 py-4 text-aid-dark font-medium placeholder:text-aid-dark/20 focus:border-aid-green/50 focus:bg-white/80 outline-none transition-all shadow-sm ${
    type === 'number' ? 'text-right font-bold' : ''
  } ${className}`;

  const labelClasses =
    'block text-[10px] font-heading font-black text-aid-dark/40 mb-2 uppercase tracking-[0.2em] transition-colors group-focus-within:text-aid-green';

  const errorClasses =
    'text-red-500 text-xs mt-2 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-1';

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
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-aid-dark/20 text-xs font-black">
            {prefix}
          </span>
          <input {...props} type={type} className={`${baseInputClasses} pl-12`} />
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
          <span className="w-1 h-1 bg-red-500 rounded-full" /> {error}
        </p>
      )}
    </div>
  );
}

export default FormInput;
