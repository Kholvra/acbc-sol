'use client';

import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { Plus } from 'lucide-react';
import type { AgreementFormData } from './schemas';
import { AgreementItemForm } from './agreement-item-form';

interface ItemsSectionProps {
  form: UseFormReturn<AgreementFormData>;
}

export function ItemsSection({ form }: ItemsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const addItem = () => {
    append({
      itemName: '',
      specifications: '',
      unitPrice: 0,
      quantity: 1,
    });
  };

  return (
    <div className="rounded-[32px] p-8 bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-heading font-black text-aid-dark flex items-center gap-3">
          <span className="w-2 h-6 bg-aid-green rounded-full shadow-[0_0_10px_rgba(187,200,99,0.3)]" />
          Items Details
        </h3>
        <button
          type="button"
          onClick={addItem}
          className="text-xs bg-aid-dark hover:bg-aid-green text-white font-black px-6 py-3 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-aid-dark/10 hover:shadow-aid-green/20 hover:scale-[1.02] active:scale-95 tracking-widest uppercase"
        >
          <Plus size={14} strokeWidth={3} /> Add Item
        </button>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <AgreementItemForm
            key={field.id}
            control={form.control}
            index={index}
            onRemove={() => remove(index)}
          />
        ))}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-12 text-aid-dark/30 border-2 border-dashed border-aid-dark/5 rounded-[24px] bg-aid-dark/[0.02]">
          <p className="font-heading font-bold">No items added yet. Click &quot;Add Item&quot; to start.</p>
        </div>
      )}
    </div>
  );
}
