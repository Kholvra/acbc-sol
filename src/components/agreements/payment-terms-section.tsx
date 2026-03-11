'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { AgreementFormData } from './schemas';

interface PaymentTermsSectionProps {
  form: UseFormReturn<AgreementFormData>;
}

export function PaymentTermsSection({ form }: PaymentTermsSectionProps) {
  const selectedTerms = form.watch('paymentTerms');

  return (
    <div className="rounded-[32px] p-8 bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <h3 className="text-xl font-heading font-black text-aid-dark mb-8 flex items-center gap-3">
        <span className="w-2 h-6 bg-aid-yellow rounded-full shadow-[0_0_10px_rgba(240,228,145,0.4)]" />
        Payment Terms
      </h3>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <label className="flex-1 cursor-pointer group">
            <input
              type="radio"
              value="FULL_PAYMENT"
              {...form.register('paymentTerms')}
              className="hidden"
            />
            <div className={`h-full p-6 border-2 rounded-[24px] transition-all duration-300 relative overflow-hidden ${
              selectedTerms === 'FULL_PAYMENT' 
                ? 'border-aid-green bg-aid-green/5 shadow-lg shadow-aid-green/10' 
                : 'border-aid-dark/5 bg-white/40 hover:border-aid-dark/20'
            }`}>
              {selectedTerms === 'FULL_PAYMENT' && (
                  <div className="absolute top-4 right-4 text-aid-green">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                  </div>
              )}
              <div className="font-heading font-black text-aid-dark mb-2 tracking-tight">Full Payment</div>
              <div className="text-xs text-aid-dark/50 font-medium leading-relaxed">Single payment after delivery and verification of goods.</div>
            </div>
          </label>

          <label className="flex-1 cursor-pointer group">
            <input
              type="radio"
              value="INSTALLMENT"
              {...form.register('paymentTerms')}
              className="hidden"
            />
            <div className={`h-full p-6 border-2 rounded-[24px] transition-all duration-300 relative overflow-hidden ${
              selectedTerms === 'INSTALLMENT' 
                ? 'border-aid-green bg-aid-green/5 shadow-lg shadow-aid-green/10' 
                : 'border-aid-dark/5 bg-white/40 hover:border-aid-dark/20'
            }`}>
              {selectedTerms === 'INSTALLMENT' && (
                  <div className="absolute top-4 right-4 text-aid-green">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                  </div>
              )}
              <div className="font-heading font-black text-aid-dark mb-2 tracking-tight">Installment</div>
              <div className="text-xs text-aid-dark/50 font-medium leading-relaxed">Multiple payments (DP + scheduled installments).</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
