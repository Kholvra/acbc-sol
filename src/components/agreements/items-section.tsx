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
    <div className="rounded-2xl p-6 bg-neutral-800 border border-neutral-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-1 h-5 bg-purple-500 rounded-full" />
          Items Details
        </h3>
        <button
          type="button"
          onClick={addItem}
          className="text-sm bg-purple-500 hover:bg-purple-400 text-white font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="space-y-4">
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
        <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
          <p>No items added yet. Click &quot;Add Item&quot; to start.</p>
        </div>
      )}
    </div>
  );
}
