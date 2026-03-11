'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { AgreementFormData } from './schemas';

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24; // 86.400.000

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
    <div className="rounded-[32px] p-8 bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <h3 className="text-xl font-heading font-black text-aid-dark mb-8 flex items-center gap-3">
        <span className="w-2 h-6 bg-aid-green rounded-full shadow-[0_0_10px_rgba(187,200,99,0.3)]" />
        Contract Period
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="group">
          <label className="block text-[10px] font-heading font-black text-aid-dark/40 mb-2 uppercase tracking-[0.2em] group-focus-within:text-aid-green transition-colors">
            Start Date *
          </label>
          <input
            type="date"
            {...form.register('startDate', { valueAsDate: true })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-white/40 border-2 border-aid-dark/5 rounded-2xl px-5 py-4 text-aid-dark font-medium focus:border-aid-green/50 focus:bg-white/80 outline-none transition-all shadow-sm cursor-pointer"
          />
          {form.formState.errors.startDate?.message && (
            <p className="text-red-500 text-xs mt-2 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                <span className="w-1 h-1 bg-red-500 rounded-full" /> {form.formState.errors.startDate.message}
            </p>
          )}
        </div>

        <div className="group">
          <label className="block text-[10px] font-heading font-black text-aid-dark/40 mb-2 uppercase tracking-[0.2em] group-focus-within:text-aid-green transition-colors">
            End Date *
          </label>
          <input
            type="date"
            {...form.register('endDate', { valueAsDate: true })}
            min={tomorrow.toISOString().split('T')[0]}
            className="w-full bg-white/40 border-2 border-aid-dark/5 rounded-2xl px-5 py-4 text-aid-dark font-medium focus:border-aid-green/50 focus:bg-white/80 outline-none transition-all shadow-sm cursor-pointer"
          />
          {form.formState.errors.endDate?.message && (
            <p className="text-red-500 text-xs mt-2 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                <span className="w-1 h-1 bg-red-500 rounded-full" /> {form.formState.errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      {daysDiff > 0 && (
        <div className="mt-6 flex items-center gap-2 text-sm font-heading font-black text-aid-dark/40 uppercase tracking-widest bg-aid-dark/[0.03] w-fit px-4 py-2 rounded-xl">
          Duration: <span className="text-aid-green">{daysDiff} days</span>
        </div>
      )}
    </div>
  );
}
