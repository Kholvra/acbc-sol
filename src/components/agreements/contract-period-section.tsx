'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { AgreementFormData } from './schemas';
import { FormSection } from '~/components/ui/form-section';
import { FormInput } from '~/components/ui/form-input';
import { DurationBadge } from '~/components/ui/duration-badge';

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

interface ContractPeriodSectionProps {
  form: UseFormReturn<AgreementFormData>;
}

export function ContractPeriodSection({ form }: ContractPeriodSectionProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startDateValue = form.watch('startDate');
  const endDateValue = form.watch('endDate');

  // Calculate days between dates
  const daysDiff = startDateValue && endDateValue
    ? Math.ceil((new Date(endDateValue).getTime() - new Date(startDateValue).getTime()) / MILLISECONDS_PER_DAY)
    : 0;

  return (
    <FormSection title="Contract Period">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormInput
          label="Start Date *"
          type="date"
          min={new Date().toISOString().split('T')[0]}
          error={form.formState.errors.startDate?.message}
          register={form.register('startDate', { valueAsDate: true })}
        />
        <FormInput
          label="End Date *"
          type="date"
          min={tomorrow.toISOString().split('T')[0]}
          error={form.formState.errors.endDate?.message}
          register={form.register('endDate', { valueAsDate: true })}
        />
      </div>
      {daysDiff > 0 && (
        <div className="mt-6">
          <DurationBadge days={daysDiff} />
        </div>
      )}
    </FormSection>
  );
}

export default ContractPeriodSection;
