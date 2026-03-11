'use client';

import type { Control } from 'react-hook-form';
import type { AgreementFormData } from './schemas';

const CATEGORIES = [
  { value: 'MEDICAL', label: 'Medis' },
  { value: 'CONSTRUCTION', label: 'Material Bangunan' },
  { value: 'GROCERIES', label: 'Kebutuhan Pokok' },
  { value: 'TRANSPORTATION', label: 'Transportasi' },
  { value: 'UTILITIES', label: 'Utilitas' },
  { value: 'OTHER', label: 'Lainnya' },
] as const;

interface BasicInfoSectionProps {
  control: Control<AgreementFormData>;
  errors?: { vendorName?: { message?: string }; category?: { message?: string } };
}

export function BasicInfoSection({ control, errors }: BasicInfoSectionProps) {
  return (
    <div className="rounded-[32px] p-8 bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <h3 className="text-xl font-heading font-black text-aid-dark mb-8 flex items-center gap-3">
        <span className="w-2 h-6 bg-aid-green rounded-full shadow-[0_0_10px_rgba(187,200,99,0.3)]" />
        Basic Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="group">
          <label className="block text-[10px] font-heading font-black text-aid-dark/40 mb-2 uppercase tracking-[0.2em] transition-colors group-focus-within:text-aid-green">
            Vendor Name *
          </label>
          <input
            {...control.register('vendorName')}
            placeholder="e.g., Apotek K24"
            className="w-full bg-white/40 border-2 border-aid-dark/5 rounded-2xl px-5 py-4 text-aid-dark font-medium placeholder:text-aid-dark/20 focus:border-aid-green/50 focus:bg-white/80 outline-none transition-all shadow-sm"
          />
          {errors?.vendorName?.message && (
            <p className="text-red-500 text-xs mt-2 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                <span className="w-1 h-1 bg-red-500 rounded-full" /> {errors.vendorName.message}
            </p>
          )}
        </div>

        <div className="group">
          <label className="block text-[10px] font-heading font-black text-aid-dark/40 mb-2 uppercase tracking-[0.2em] transition-colors group-focus-within:text-aid-green">
            Category *
          </label>
          <div className="relative">
              <select
                {...control.register('category')}
                className="w-full bg-white/40 border-2 border-aid-dark/5 rounded-2xl px-5 py-4 text-aid-dark font-medium appearance-none focus:border-aid-green/50 focus:bg-white/80 outline-none transition-all shadow-sm cursor-pointer"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-aid-dark/30">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
          </div>
          {errors?.category?.message && (
            <p className="text-red-500 text-xs mt-2 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                <span className="w-1 h-1 bg-red-500 rounded-full" /> {errors.category.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
