import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { CheckCircle2 } from 'lucide-react';

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
    'h-full p-5 border-2 rounded-2xl transition-all duration-200 relative overflow-hidden cursor-pointer';

  const selectedCardClasses =
    'border-aid-green bg-aid-green/10 shadow-md';

  const unselectedCardClasses =
    'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50';

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <label key={option.value} className="flex-1 group">
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
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-aid-green' : 'text-gray-300'}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-heading font-bold text-aid-dark mb-1">
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-sm text-gray-500 leading-relaxed">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default RadioCardGroup;
