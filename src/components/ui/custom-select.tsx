'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '~/lib/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  register?: UseFormRegisterReturn;
}

export function CustomSelect({
  label,
  options,
  placeholder = 'Select option',
  error,
  value,
  onChange,
  register,
}: CustomSelectProps) {
  const labelClasses = 'block text-xs font-heading font-bold text-gray-600 mb-2';
  const errorClasses =
    'text-red-500 text-xs mt-2 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1';

  const triggerClasses = cn(
    'w-full bg-gray-50 border rounded-xl px-4 py-3 text-aid-dark font-medium outline-none transition-all duration-200 flex items-center justify-between',
    'hover:border-gray-300 hover:bg-gray-100',
    'focus:bg-white focus:border-aid-green focus:ring-2 focus:ring-aid-green/20',
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/50 hover:bg-red-50/70'
      : 'border-gray-200'
  );

  const handleValueChange = (newValue: string) => {
    // Ignore empty string - Radix sometimes calls this with empty value
    if (!newValue || newValue === '') {
      return;
    }

    if (onChange) {
      onChange(newValue);
    }
    // Create a synthetic event for react-hook-form
    if (register?.onChange) {
      const syntheticEvent = {
        target: { value: newValue },
        type: 'change',
      } as React.ChangeEvent<HTMLSelectElement>;
      void register.onChange(syntheticEvent);
    }
  };

  // Always pass a string value to avoid controlled/uncontrolled warning
  const normalizedValue = value && options.some(opt => opt.value === value) ? value : '';

  const handleOpenChange = (open: boolean) => {
    if (!open && register?.onBlur) {
      const syntheticEvent = {
        target: { value: value ?? '' },
        type: 'blur',
      } as React.FocusEvent<HTMLSelectElement>;
      void register.onBlur(syntheticEvent);
    }
  };

  return (
    <div className="group">
      <label className={labelClasses}>{label}</label>
      <SelectPrimitive.Root
        value={normalizedValue}
        onValueChange={handleValueChange}
        onOpenChange={handleOpenChange}
      >
        <SelectPrimitive.Trigger
          ref={register?.ref as React.Ref<HTMLButtonElement>}
          className={triggerClasses}
        >
          <SelectPrimitive.Value placeholder={placeholder}>
            {normalizedValue ? options.find(o => o.value === normalizedValue)?.label : undefined}
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 z-50 min-w-[var(--radix-select-trigger-width)]"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'relative flex items-center px-3 py-2.5 rounded-lg text-sm text-aid-dark cursor-pointer outline-none select-none',
                    'hover:bg-aid-green/10 hover:text-aid-dark',
                    'focus:bg-aid-green/10 focus:text-aid-dark',
                    'data-[state=checked]:bg-aid-green/20 data-[state=checked]:font-medium'
                  )}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check className="w-4 h-4 text-aid-green ml-2" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && (
        <p className={errorClasses}>
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {error}
        </p>
      )}
    </div>
  );
}

export default CustomSelect;
