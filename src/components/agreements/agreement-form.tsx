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
import { Stepper } from '~/components/ui/stepper';
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

const steps = [
  { number: 1, label: 'Details', id: 'details' },
  { number: 2, label: 'Review', id: 'review' },
  { number: 3, label: 'Submit', id: 'submit' },
];

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

  const handleNextStep = async (targetStep: number) => {
    // Validate current section before moving to next step
    if (targetStep === 2) {
      // Validate step 1 fields: vendorName, category, items, startDate, endDate, paymentTerms
      const isValid = await form.trigger(['vendorName', 'category', 'items', 'startDate', 'endDate', 'paymentTerms']);
      if (!isValid) return;
    }
    setCurrentStep(targetStep);
  };

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <div>
      {/* Error Summary Banner */}
      {hasErrors && currentStep === 1 && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-red-800 text-sm">Mohon lengkapi semua field yang wajib</p>
              <p className="text-red-600 text-xs mt-1">
                Scroll ke atas untuk melihat error di setiap section
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <Stepper steps={steps} currentStep={currentStep} />

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
                size="lg"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => handleNextStep(2)}
                className="flex-[2]"
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
                size="lg"
                onClick={() => setCurrentStep(1)}
                className="flex-1"
              >
                ← Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => handleNextStep(3)}
                className="flex-[2]"
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
                size="lg"
                onClick={() => setCurrentStep(2)}
                className="flex-1"
              >
                ← Back
              </Button>
              <Button
                type="submit"
                variant="success"
                size="lg"
                isLoading={isSubmitting}
                className="flex-[2]"
              >
                ✓ Submit Agreement
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default AgreementForm;
