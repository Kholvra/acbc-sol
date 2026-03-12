'use client';

import { useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { agreementFormSchema, type AgreementFormData, getDefaultEndDate } from './schemas';
import { BasicInfoSection } from './basic-info-section';
import { ItemsSection } from './items-section';
import { ContractPeriodSection } from './contract-period-section';
import { PaymentTermsSection } from './payment-terms-section';
import { FormSummary } from './form-summary';
import { Stepper } from '~/components/ui/stepper';
import Button from '~/components/ui/button';

const scrollToFirstError = (errors: FieldErrors<AgreementFormData>) => {
  // check top-level fields first
  const topLevelOrder: (keyof AgreementFormData)[] = ['vendorName', 'category', 'startDate', 'endDate', 'paymentTerms'];
  
  for (const fieldName of topLevelOrder) {
    if (errors[fieldName]) {
      const element = document.querySelector(`[data-error-field="${String(fieldName)}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
  }
  
  // check items array errors
  if (errors.items) {
    const itemsError = errors.items;
    
    // array-level error
    if (typeof itemsError === 'object' && 'message' in itemsError) {
      const element = document.querySelector('[data-error-field="items"]');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    
    // individual item errors
    if (Array.isArray(itemsError)) {
      for (let i = 0; i < itemsError.length; i++) {
        const itemError = itemsError[i] as { itemName?: { message?: string }; unitPrice?: { message?: string }; quantity?: { message?: string } } | undefined;
        if (itemError) {
          // check which field has error
          const itemFieldOrder = ['itemName', 'unitPrice', 'quantity'] as const;
          for (const itemField of itemFieldOrder) {
            if (itemError[itemField]?.message) {
              const element = document.querySelector(`[data-error-field="items.${i}.${itemField}"]`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
              }
            }
          }
        }
      }
    }
  }
};

interface AgreementFormProps {
  campaignId: string;
  initialData?: Partial<AgreementFormData>;
  onSubmit?: (data: AgreementFormData) => Promise<void>;
  onCancel?: () => void;
}

const defaultFormValues = {
  campaignId: '',
  vendorName: '',
  category: 'MEDICAL' as const,
  items: [{ itemName: '', specifications: '', unitPrice: 0, quantity: 1 }],
  startDate: new Date().toISOString().split('T')[0],
  endDate: getDefaultEndDate().toISOString().split('T')[0],
  paymentTerms: 'FULL_PAYMENT' as const,
};

const steps = [
  { number: 1, label: 'Details', id: 'details' },
  { number: 2, label: 'Review', id: 'review' },
  { number: 3, label: 'Submit', id: 'submit' },
];

export function AgreementForm({ campaignId, initialData, onSubmit, onCancel }: AgreementFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AgreementFormData>({
    resolver: zodResolver(agreementFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      ...defaultFormValues,
      campaignId,
      vendorName: initialData?.vendorName ?? '',
      category: initialData?.category ?? 'MEDICAL',
      items: initialData?.items ?? defaultFormValues.items,
      startDate: initialData?.startDate ?? new Date().toISOString().split('T')[0],
      endDate: initialData?.endDate ?? getDefaultEndDate().toISOString().split('T')[0],
      paymentTerms: initialData?.paymentTerms ?? 'FULL_PAYMENT',
    },
  });

  const handleFinalSubmit = async (data: AgreementFormData) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // default: log to console for phase 1
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
    if (targetStep === 2) {
      // validate step 1 fields
      const isValid = await form.trigger(['vendorName', 'category', 'items', 'startDate', 'endDate', 'paymentTerms']);
      if (!isValid) {
        setTimeout(() => {
          scrollToFirstError(form.formState.errors);
        }, 100);
        return;
      }
    }
    setCurrentStep(targetStep);
  };

  return (
    <div>
      <Stepper steps={steps} currentStep={currentStep} />

      <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-8">
        {/* step 1: input sections */}
        {currentStep === 1 && (
          <>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <BasicInfoSection
                form={form}
                errors={form.formState.errors}
              />

              <ItemsSection form={form} errors={form.formState.errors} />

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

        {/* step 2: review */}
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

        {/* step 3: submit */}
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
