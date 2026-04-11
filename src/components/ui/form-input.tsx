import React, { useRef, useEffect, useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import type { LucideIcon } from 'lucide-react';

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
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  autoResize?: boolean;
  minHeight?: number;
  maxHeight?: number;
}

export function FormInput({
  label,
  type = 'text',
  placeholder,
  error,
  prefix,
  rows: _rows = 3,
  min,
  className = '',
  register,
  onChange,
  value,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  autoResize = true,
  minHeight = 80,
  maxHeight = 300,
}: FormInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textareaHeight, setTextareaHeight] = useState(minHeight);

  // Auto-resize textarea
  useEffect(() => {
    if (type === 'textarea' && textareaRef.current && autoResize) {
      const textarea = textareaRef.current;
      // Reset height to get correct scrollHeight
      textarea.style.height = 'auto';
      // Calculate new height
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
      setTextareaHeight(newHeight);
    }
  }, [type, value, autoResize, minHeight, maxHeight]);

  const baseInputClasses = `w-full bg-gray-50 border rounded-xl px-4 py-3 text-aid-dark font-medium placeholder:text-gray-400 outline-none transition-all duration-200 ${
    type === 'number' ? 'text-right font-bold' : ''
  } ${
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/50 hover:bg-red-50/70'
      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100 focus:bg-white focus:border-aid-green focus:ring-2 focus:ring-aid-green/20'
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
          ref={(e) => {
            // Combine register ref with our ref
            if (register?.ref) {
              if (typeof register.ref === 'function') {
                register.ref(e);
              } else {
                (register.ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = e;
              }
            }
            (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = e;
          }}
          style={{ 
            height: autoResize ? `${textareaHeight}px` : undefined,
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`,
          }}
          className={`${baseInputClasses} resize-none overflow-y-auto`}
        />
      );
    }

    // Calculate padding based on icons
    const leftPadding = LeftIcon ? 'pl-12' : prefix ? 'pl-10' : '';
    const rightPadding = RightIcon ? 'pr-10' : '';

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

    if (type === 'date') {
      return (
        <input {...props} type={type} className={baseInputClasses} />
      );
    }

    // Input with icons
    if (LeftIcon || RightIcon) {
      return (
        <div className="relative">
          {LeftIcon && (
            <LeftIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          )}
          <input 
            {...props} 
            type={type} 
            className={`${baseInputClasses} ${leftPadding} ${rightPadding}`} 
          />
          {RightIcon && (
            <RightIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          )}
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
