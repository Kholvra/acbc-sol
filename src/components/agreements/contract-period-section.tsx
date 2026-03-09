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
    <div className="rounded-2xl p-6 bg-neutral-800 border border-neutral-700">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-emerald-500 rounded-full" />
        Contract Period
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            Start Date *
          </label>
          <input
            type="date"
            {...form.register('startDate', { valueAsDate: true })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition-all [color-scheme:dark]"
          />
          {form.formState.errors.startDate?.message && (
            <p className="text-red-400 text-xs mt-1">{form.formState.errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            End Date *
          </label>
          <input
            type="date"
            {...form.register('endDate', { valueAsDate: true })}
            min={tomorrow.toISOString().split('T')[0]}
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition-all [color-scheme:dark]"
          />
          {form.formState.errors.endDate?.message && (
            <p className="text-red-400 text-xs mt-1">{form.formState.errors.endDate.message}</p>
          )}
        </div>
      </div>

      {daysDiff > 0 && (
        <div className="mt-4 text-sm text-slate-400">
          Duration: <span className="text-emerald-400 font-bold">{daysDiff} days</span>
        </div>
      )}
    </div>
  );
}
