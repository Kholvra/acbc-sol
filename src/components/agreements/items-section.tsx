'use client';

import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { Plus } from 'lucide-react';
import type { AgreementFormData } from './schemas';
import { AgreementItemForm } from './agreement-item-form';
import { FormSection } from '~/components/ui/form-section';
import { EmptyState } from '~/components/ui/empty-state';

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
    <FormSection
      title="Items Details"
      className="relative"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-heading font-black text-aid-dark uppercase tracking-wider">
            Add all items for this purchase agreement
          </span>
        </div>
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
        <EmptyState
          title="No items added yet"
          description="Click 'Add Item' to start adding items to your agreement"
          action={{
            label: 'Add Item',
            onClick: addItem,
          }}
        />
      )}
    </FormSection>
  );
}

export default ItemsSection;
