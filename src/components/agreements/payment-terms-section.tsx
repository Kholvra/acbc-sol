'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { AgreementFormData } from './schemas';
import { FormSection } from '~/components/ui/form-section';
import { RadioCardGroup } from '~/components/ui/radio-card-group';

interface PaymentTermsSectionProps {
  form: UseFormReturn<AgreementFormData>;
}

export function PaymentTermsSection({ form }: PaymentTermsSectionProps) {
  const selectedTerms = form.watch('paymentTerms');

  const paymentOptions = [
    {
      value: 'FULL_PAYMENT',
      label: 'Full Payment',
      description: 'Single payment after delivery and verification of goods.',
    },
    {
      value: 'INSTALLMENT',
      label: 'Installment',
      description: 'Multiple payments (DP + scheduled installments).',
    },
  ];

  return (
    <FormSection title="Payment Terms" accentColor="yellow">
      <RadioCardGroup
        name="paymentTerms"
        options={paymentOptions}
        value={selectedTerms}
        onChange={(value) => form.setValue('paymentTerms', value as 'FULL_PAYMENT' | 'INSTALLMENT')}
        register={form.register('paymentTerms')}
      />
    </FormSection>
  );
}

export default PaymentTermsSection;
