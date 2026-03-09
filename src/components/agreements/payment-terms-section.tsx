'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { AgreementFormData } from './schemas';

interface PaymentTermsSectionProps {
  form: UseFormReturn<AgreementFormData>;
}

export function PaymentTermsSection({ form }: PaymentTermsSectionProps) {
  return (
    <div className="rounded-2xl p-6 bg-neutral-800 border border-neutral-700">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-amber-500 rounded-full" />
        Payment Terms
      </h3>

      <div className="space-y-4">
        <div className="flex gap-4">
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              value="FULL_PAYMENT"
              {...form.register('paymentTerms')}
              className="hidden"
            />
            <div className="p-4 border-2 rounded-xl transition-all border-cyan-500 bg-cyan-500/10">
              <div className="font-bold text-white mb-1">Full Payment</div>
              <div className="text-xs text-slate-400">Single payment after delivery</div>
            </div>
          </label>

          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              value="INSTALLMENT"
              {...form.register('paymentTerms')}
              className="hidden"
            />
            <div className="p-4 border-2 border-slate-700 rounded-xl transition-all hover:border-slate-600">
              <div className="font-bold text-white mb-1">Installment</div>
              <div className="text-xs text-slate-400">Multiple payments (DP + cicilan)</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
