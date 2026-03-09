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
    <div className="rounded-2xl p-6 bg-neutral-800 border border-neutral-700">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-cyan-500 rounded-full" />
        Basic Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            Vendor *
          </label>
          <input
            {...control.register('vendorName')}
            placeholder="e.g., Apotek K24"
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500/50 outline-none transition-all"
          />
          {errors?.vendorName?.message && (
            <p className="text-red-400 text-xs mt-1">{errors.vendorName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            Category *
          </label>
          <select
            {...control.register('category')}
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500/50 outline-none transition-all"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors?.category?.message && (
            <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
