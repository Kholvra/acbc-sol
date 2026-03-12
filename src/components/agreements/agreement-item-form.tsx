'use client';

import { useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { X } from 'lucide-react';
import type { AgreementFormData } from './schemas';
import { FormInput } from '~/components/ui/form-input';

interface AgreementItemFormProps {
  control: Control<AgreementFormData>;
  index: number;
  onRemove: () => void;
}

export function AgreementItemForm({ control, index, onRemove }: AgreementItemFormProps) {
  const item = useWatch({
    control,
    name: `items.${index}`,
  });

  const subtotal = (item?.unitPrice ?? 0) * (item?.quantity ?? 1);

  return (
    <div className="bg-white/40 border border-white/60 rounded-[24px] p-6 group hover:border-aid-green/30 hover:bg-white/60 transition-all duration-300 shadow-sm relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-aid-green/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-aid-green/10 transition-colors" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-aid-dark text-white flex items-center justify-center text-xs font-black">
            {index + 1}
          </span>
          <span className="text-sm font-heading font-black text-aid-dark uppercase tracking-wider">
            Item Details
          </span>
        </div>
        {index > 0 && (
          <button
            type="button"
            onClick={onRemove}
            className="w-8 h-8 rounded-full flex items-center justify-center text-aid-dark/20 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <X size={18} strokeWidth={3} />
          </button>
        )}
      </div>

      <div className="space-y-6 relative z-10">
        <FormInput
          label="Item Name *"
          type="text"
          placeholder="e.g., Paracetamol 500mg"
          register={control.register(`items.${index}.itemName`)}
        />

        <FormInput
          label="Specifications"
          type="textarea"
          placeholder="e.g., Box isi 100 tablet"
          register={control.register(`items.${index}.specifications`)}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            label="Price per Unit (IDR) *"
            type="number"
            prefix="Rp"
            register={control.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
          />

          <FormInput
            label="Quantity *"
            type="number"
            register={control.register(`items.${index}.quantity`, { valueAsNumber: true })}
          />

          <div>
            <label className="block text-[10px] font-heading font-black text-aid-dark/40 mb-2 uppercase tracking-[0.2em]">
              Subtotal
            </label>
            <div className="w-full bg-aid-green/10 border-2 border-aid-green/20 rounded-2xl px-5 py-3 text-aid-dark text-right font-heading font-black text-lg shadow-sm shadow-aid-green/5 animate-in fade-in zoom-in-95 duration-500">
              <span className="text-[10px] font-black text-aid-dark/40 mr-1 uppercase">IDR</span>
              {subtotal.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgreementItemForm;
