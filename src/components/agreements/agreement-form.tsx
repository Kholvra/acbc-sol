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
      <div className="relative mb-16 max-w-[320px] md:max-w-[440px] mx-auto px-6">
        {/* Background track */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-aid-dark/10 rounded-full" />
        
        {/* Progress fill line */}
        <div
          className="absolute top-6 left-6 h-1 bg-aid-dark transition-all duration-500 ease-out rounded-full"
          style={{
            width: `calc(((100% - 48px) / ${steps.length - 1}) * ${currentStep - 1})`,
          }}
        />

        <div className="flex justify-between items-center relative z-10">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center group">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-black text-lg transition-all duration-500 transform
                  ${currentStep >= step.number
                    ? 'bg-aid-dark text-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] scale-110'
                    : 'bg-white text-aid-dark/40 border-2 border-aid-dark/20 backdrop-blur-sm'
                  }`}
              >
                {step.number}
              </div>
              <span
                className={`mt-3 text-[10px] md:text-xs font-heading font-black uppercase tracking-widest transition-colors duration-500 whitespace-nowrap
                  ${currentStep >= step.number ? 'text-aid-dark' : 'text-aid-dark/30'}`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-8">
        {/* Step 1: All Input Sections */}
        {currentStep === 1 && (
          <>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BasicInfoSection
                  control={form.control}
                  errors={form.formState.errors}
                />

                <ItemsSection form={form} />

                <ContractPeriodSection form={form} />

                <PaymentTermsSection form={form} />
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-2 border-aid-dark/10 text-aid-dark font-bold hover:bg-aid-dark/5 rounded-2xl py-4"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToReview()}
                className="flex-[2] bg-aid-dark text-white font-black rounded-2xl py-4 shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                Continue to Review →
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Review */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <FormSummary formData={form.getValues()} />
            <div className="flex gap-4 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex-1 border-2 border-aid-dark/10 text-aid-dark font-bold hover:bg-aid-dark/5 rounded-2xl py-4"
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex-[2] bg-aid-dark text-white font-black rounded-2xl py-4 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                Confirm & Submit →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Final Submit */}
        {currentStep === 3 && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <FormSummary formData={form.getValues()} />
            <div className="mt-8 bg-aid-green/10 border-2 border-aid-green/20 rounded-3xl p-8 text-center backdrop-blur-sm">
              <div className="w-16 h-16 bg-aid-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-aid-green/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-aid-dark font-heading font-black text-xl mb-2">Ready to Submit</p>
              <p className="text-aid-dark/60 font-medium max-w-sm mx-auto">
                By submitting, you agree to the terms and confirm that all information provided is accurate.
              </p>
            </div>
            <div className="flex gap-4 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="flex-1 border-2 border-aid-dark/10 text-aid-dark font-bold hover:bg-aid-dark/5 rounded-2xl py-4"
              >
                ← Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-aid-green text-white font-black rounded-2xl py-4 shadow-xl hover:shadow-aid-green/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {isSubmitting ? 'Submitting...' : '✓ Submit Agreement'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
