'use client';

import { useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { agreementFormSchema, type AgreementFormData, getDefaultEndDate, DEFAULT_CONTRACT_DAYS } from './schemas';
import { BasicInfoSection } from './basic-info-section';
import { ItemsSection } from './items-section';
import { ContractPeriodSection } from './contract-period-section';
import { PaymentTermsSection } from './payment-terms-section';
import { FormSummary } from './form-summary';
import Button from '~/components/ui/button';

interface AgreementFormProps {
  campaignId: string;
  initialData?: Partial<AgreementFormData>;
  onSubmit?: (data: AgreementFormData) => Promise<void>;
  onCancel?: () => void;
}

const defaultFormValues: AgreementFormData = {
  campaignId: '',
  vendorName: '',
  category: 'MEDICAL',
  items: [{ itemName: '', specifications: '', unitPrice: 0, quantity: 1 }],
  startDate: new Date(),
  endDate: getDefaultEndDate(),
  paymentTerms: 'FULL_PAYMENT',
};

export function AgreementForm({ campaignId, initialData, onSubmit, onCancel }: AgreementFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form: UseFormReturn<AgreementFormData> = useForm<AgreementFormData>({
    resolver: zodResolver(agreementFormSchema),
    defaultValues: {
      ...defaultFormValues,
      campaignId,
      vendorName: initialData?.vendorName ?? '',
      category: initialData?.category ?? 'MEDICAL',
      items: initialData?.items ?? defaultFormValues.items,
      startDate: initialData?.startDate ?? new Date(),
      endDate: initialData?.endDate ?? getDefaultEndDate(undefined, DEFAULT_CONTRACT_DAYS),
      paymentTerms: initialData?.paymentTerms ?? 'FULL_PAYMENT',
    },
  });

  const handleFinalSubmit = async (data: AgreementFormData) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default: log to console for Phase 1
        console.log('=== FORM SUBMITTED ===');
        console.log(JSON.stringify(data, null, 2));
        alert('Form submitted! Check console for data.');
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: 'Details', id: 'details' },
    { number: 2, label: 'Review', id: 'review' },
    { number: 3, label: 'Submit', id: 'submit' },
  ];

  const canProceedToReview = () => {
    const values = form.getValues();
    return (
      values.vendorName.trim() !== '' &&
      values.items.length > 0 &&
      values.items.every((item) =>
        item.itemName.trim() !== '' && item.quantity >= 1 && item.unitPrice >= 0
      )
    );
  };

  return (
    <div>
      {/* Progress Steps */}
      <div className="flex justify-center items-center gap-16 mb-12 relative">
        <div className="absolute top-6 left-1/4 right-1/4 h-0.5 bg-slate-800 -z-10" />
        <div
          className="absolute top-6 h-0.5 bg-cyan-500 transition-all duration-700 -z-10"
          style={{ width: `${((currentStep - 1) * 50)}%`, left: '25%' }}
        />

        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center relative z-10">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all
                ${currentStep >= step.number
                  ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
            >
              {step.number}
            </div>
            <span
              className={`mt-2 text-xs font-medium uppercase tracking-wider transition-colors
                ${currentStep >= step.number ? 'text-cyan-400' : 'text-slate-500'}`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-6">
        {/* Step 1: All Input Sections */}
        {currentStep === 1 && (
          <>
            <BasicInfoSection
              control={form.control}
              errors={form.formState.errors}
            />

            <ItemsSection form={form} />

            <ContractPeriodSection form={form} />

            <PaymentTermsSection form={form} />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToReview()}
                className="flex-[2] bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold"
              >
                Continue to Review →
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Review */}
        {currentStep === 2 && (
          <>
            <FormSummary formData={form.getValues()} />
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex-[2] bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold"
              >
                Confirm & Submit →
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Final Submit */}
        {currentStep === 3 && (
          <>
            <FormSummary formData={form.getValues()} />
            <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-purple-500/20 rounded-lg p-6 text-center">
              <p className="text-white font-bold mb-2">Ready to Submit</p>
              <p className="text-sm text-slate-400">
                By submitting, you agree to the terms and confirm that all information provided is accurate.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                ← Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:scale-105 transition-transform"
              >
                {isSubmitting ? 'Submitting...' : '✓ Submit Agreement'}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
