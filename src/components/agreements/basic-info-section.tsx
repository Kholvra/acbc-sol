'use client';

import type { Control } from 'react-hook-form';
import type { AgreementFormData } from './schemas';
import { FormSection } from '~/components/ui/form-section';
import { FormInput } from '~/components/ui/form-input';
import { FormSelect } from '~/components/ui/form-select';

const CATEGORIES = [
  { value: 'MEDICAL', label: 'Medis' },
  { value: 'CONSTRUCTION', label: 'Material Bangunan' },
  { value: 'GROCERIES', label: 'Kebutuhan Pokok' },
  { value: 'TRANSPORTATION', label: 'Transportasi' },
  { value: 'UTILITIES', label: 'Utilitas' },
  { value: 'OTHER', label: 'Lainnya' },
];

interface BasicInfoSectionProps {
  control: Control<AgreementFormData>;
  errors?: { vendorName?: { message?: string }; category?: { message?: string } };
}

export function BasicInfoSection({ control, errors }: BasicInfoSectionProps) {
  return (
    <FormSection title="Basic Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormInput
          label="Vendor Name *"
          type="text"
          placeholder="e.g., Apotek K24"
          error={errors?.vendorName?.message}
          register={control.register('vendorName')}
        />
        <FormSelect
          label="Category *"
          options={CATEGORIES}
          placeholder="Select category"
          error={errors?.category?.message}
          register={control.register('category')}
        />
      </div>
    </FormSection>
  );
}

export default BasicInfoSection;
