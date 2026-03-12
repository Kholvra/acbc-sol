'use client';

import { useWatch } from 'react-hook-form';
import type { Control, FieldError } from 'react-hook-form';
import { X } from 'lucide-react';
import type { AgreementFormData } from './schemas';
import { FormInput } from '~/components/ui/form-input';
import { FormCurrencyInput } from '~/components/ui/form-currency-input';
import Button from '~/components/ui/button';

interface AgreementItemFormProps {
  control: Control<AgreementFormData>;
  index: number;
  onRemove: () => void;
  errors?: {
    itemName?: FieldError;
    specifications?: FieldError;
    unitPrice?: FieldError;
    quantity?: FieldError;
  };
}

export function AgreementItemForm({ control, index, onRemove, errors }: AgreementItemFormProps) {
  const item = useWatch({
    control,
    name: `items.${index}`,
  });

  // Parse unitPrice in case it's a formatted string (e.g., "1.000.000")
  const unitPrice = typeof item?.unitPrice === 'string'
    ? parseFloat(item.unitPrice.replace(/\./g, '')) || 0
    : (item?.unitPrice ?? 0);

  const subtotal = unitPrice * (item?.quantity ?? 1);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 group hover:border-aid-green/50 transition-all duration-200 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-aid-dark text-white flex items-center justify-center text-sm font-bold">
            {index + 1}
          </span>
          <span className="text-sm font-heading font-bold text-aid-dark">
            Item Details
          </span>
        </div>
        {index > 0 && (
          <Button
            type="button"
            onClick={onRemove}
            variant="ghost"
            size="icon"
            className="text-aid-dark/30 hover:text-red-500 hover:bg-red-50"
          >
            <X size={18} strokeWidth={3} />
          </Button>
        )}
      </div>

      <div className="space-y-6 relative z-10">
        <div data-error-field={`items.${index}.itemName`}>
          <FormInput
            label="Item Name *"
            type="text"
            placeholder="e.g., Paracetamol 500mg"
            register={control.register(`items.${index}.itemName`)}
            error={errors?.itemName?.message}
          />
        </div>

        <div data-error-field={`items.${index}.specifications`}>
          <FormInput
            label="Specifications"
            type="textarea"
            placeholder="e.g., Box isi 100 tablet"
            register={control.register(`items.${index}.specifications`)}
            error={errors?.specifications?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div data-error-field={`items.${index}.unitPrice`}>
            <FormCurrencyInput
              label="Price per Unit (IDR) *"
              register={control.register(`items.${index}.unitPrice`)}
              value={item?.unitPrice}
              error={errors?.unitPrice?.message}
            />
          </div>

          <div data-error-field={`items.${index}.quantity`}>
            <FormInput
              label="Quantity *"
              type="number"
              register={control.register(`items.${index}.quantity`, { valueAsNumber: true })}
              error={errors?.quantity?.message}
            />
          </div>

          <div>
            <label className="block text-xs font-heading font-bold text-gray-600 mb-2">
              Subtotal
            </label>
            <div className="w-full bg-aid-green/10 border border-aid-green/30 rounded-xl px-4 py-3 text-aid-dark text-right font-heading font-bold text-lg">
              <span className="text-xs font-bold text-aid-dark/60 mr-1">IDR</span>
              {subtotal.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgreementItemForm;
