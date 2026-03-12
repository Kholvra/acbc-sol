import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioCardGroupProps {
  name: string;
  options: RadioCardOption[];
  value: string;
  onChange: (value: string) => void;
  register?: UseFormRegisterReturn;
  className?: string;
}

export function RadioCardGroup({
  name,
  options,
  value,
  onChange,
  register,
  className = '',
}: RadioCardGroupProps) {
  const baseCardClasses =
    'h-full p-6 border-2 rounded-[24px] transition-all duration-300 relative overflow-hidden';

  const selectedCardClasses =
    'border-aid-green bg-aid-green/5 shadow-lg shadow-aid-green/10';

  const unselectedCardClasses =
    'border-aid-dark/5 bg-white/40 hover:border-aid-dark/20';

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <label key={option.value} className="flex-1 cursor-pointer group">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="hidden"
                {...register}
              />
              <div
                className={`${baseCardClasses} ${
                  isSelected ? selectedCardClasses : unselectedCardClasses
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 text-aid-green">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <div className="font-heading font-black text-aid-dark mb-2 tracking-tight">
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-xs text-aid-dark/50 font-medium leading-relaxed">
                    {option.description}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default RadioCardGroup;
