'use client';

import { useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { X } from 'lucide-react';
import type { AgreementFormData } from './schemas';

interface AgreementItemFormProps {
  control: Control<AgreementFormData>;
  index: number;
  onRemove: () => void;
}

export function AgreementItemForm({ control, index, onRemove }: AgreementItemFormProps) {
  const item = useWatch({
    control,
    name: `items.${index}`,
  });

  const subtotal = (item?.unitPrice ?? 0) * (item?.quantity ?? 1);

  return (
    <div className="bg-slate-900/30 border border-white/5 rounded-xl p-5 group hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-white">Item #{index + 1}</span>
        {index > 0 && (
          <button
            type="button"
            onClick={onRemove}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            Item Name *
          </label>
          <input
            {...control.register(`items.${index}.itemName`)}
            placeholder="e.g., Paracetamol 500mg"
            className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500/50 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            Specifications
          </label>
          <textarea
            {...control.register(`items.${index}.specifications`)}
            placeholder="e.g., Box isi 100 tablet"
            rows={2}
            className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500/50 outline-none transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
              Price per Unit (IDR) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">Rp</span>
              <input
                type="number"
                {...control.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-right focus:border-purple-500/50 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
              Quantity *
            </label>
            <input
              type="number"
              {...control.register(`items.${index}.quantity`, { valueAsNumber: true })}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white text-center focus:border-purple-500/50 outline-none transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
              Subtotal
            </label>
            <div className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-purple-400 text-right font-mono font-bold">
              Rp {subtotal.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
