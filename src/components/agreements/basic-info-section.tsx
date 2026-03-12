'use client';

import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { AgreementFormData } from './schemas';
import { FormSection } from '~/components/ui/form-section';
import { FormInput } from '~/components/ui/form-input';
import { CustomSelect } from '~/components/ui/custom-select';

const CATEGORIES = [
  { value: 'MEDICAL', label: 'Medis' },
  { value: 'CONSTRUCTION', label: 'Material Bangunan' },
  { value: 'GROCERIES', label: 'Kebutuhan Pokok' },
  { value: 'TRANSPORTATION', label: 'Transportasi' },
  { value: 'UTILITIES', label: 'Utilitas' },
  { value: 'OTHER', label: 'Lainnya' },
];

interface BasicInfoSectionProps {
  form: UseFormReturn<AgreementFormData>;
  errors?: { vendorName?: { message?: string }; category?: { message?: string } };
}

export function BasicInfoSection({ form, errors }: BasicInfoSectionProps) {
  const [categoryValue, setCategoryValue] = useState<string>('');

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.category) {
        setCategoryValue(value.category);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <FormSection title="Basic Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div data-error-field="vendorName">
          <FormInput
            label="Vendor Name *"
            type="text"
            placeholder="e.g., Apotek K24"
            error={errors?.vendorName?.message}
            register={form.register('vendorName')}
          />
        </div>
        <div data-error-field="category">
          <CustomSelect
            label="Category *"
            options={CATEGORIES}
            placeholder="Select category"
            value={categoryValue || ''}
            error={errors?.category?.message}
            register={form.register('category')}
            onChange={(value) => {
              setCategoryValue(value);
              form.setValue('category', value as AgreementFormData['category'], { shouldValidate: true });
            }}
          />
        </div>
      </div>
    </FormSection>
  );
}

export default BasicInfoSection;
