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
    <div className="bg-white/40 border border-white/60 rounded-[24px] p-6 group hover:border-aid-green/30 hover:bg-white/60 transition-all duration-300 shadow-sm relative overflow-hidden">
       {/* Background Accent */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-aid-green/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-aid-green/10 transition-colors" />
        
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-aid-dark text-white flex items-center justify-center text-xs font-black">
                {index + 1}
            </span>
            <span className="text-sm font-heading font-black text-aid-dark uppercase tracking-wider">
                Item Details
            </span>
        </div>
        {index > 0 && (
          <button
            type="button"
            onClick={onRemove}
            className="w-8 h-8 rounded-full flex items-center justify-center text-aid-dark/20 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <X size={18} strokeWidth={3} />
          </button>
        )}
      </div>

      <div className="space-y-6 relative z-10">
        <div className="group">
          <label className="block text-[10px] font-heading font-black text-aid-dark/40 mb-2 uppercase tracking-[0.2em] group-focus-within:text-aid-green transition-colors">
            Item Name *
          </label>
          <input
            {...control.register(`items.${index}.itemName`)}
            placeholder="e.g., Paracetamol 500mg"
            className="w-full bg-white/50 border-2 border-aid-dark/5 rounded-2xl px-5 py-3 text-aid-dark font-medium placeholder:text-aid-dark/20 focus:border-aid-green/50 focus:bg-white/80 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="group">
          <label className="block text-[10px] font-heading font-black text-aid-dark/40 mb-2 uppercase tracking-[0.2em] group-focus-within:text-aid-green transition-colors">
            Specifications
          </label>
          <textarea
            {...control.register(`items.${index}.specifications`)}
            placeholder="e.g., Box isi 100 tablet"
            rows={2}
            className="w-full bg-white/50 border-2 border-aid-dark/5 rounded-2xl px-5 py-3 text-aid-dark font-medium placeholder:text-aid-dark/20 focus:border-aid-green/50 focus:bg-white/80 outline-none transition-all resize-none shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group">
            <label className="block text-[10px] font-heading font-black text-aid-dark/40 mb-2 uppercase tracking-[0.2em] group-focus-within:text-aid-green transition-colors">
              Price per Unit (IDR) *
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-aid-dark/20 text-xs font-black">Rp</span>
              <input
                type="number"
                {...control.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                className="w-full bg-white/50 border-2 border-aid-dark/5 rounded-2xl pl-12 pr-5 py-3 text-aid-dark font-bold text-right focus:border-aid-green/50 focus:bg-white/80 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-heading font-black text-aid-dark/40 mb-2 uppercase tracking-[0.2em] group-focus-within:text-aid-green transition-colors">
              Quantity *
            </label>
            <input
              type="number"
              {...control.register(`items.${index}.quantity`, { valueAsNumber: true })}
              className="w-full bg-white/50 border-2 border-aid-dark/5 rounded-2xl px-5 py-3 text-aid-dark font-bold text-center focus:border-aid-green/50 focus:bg-white/80 outline-none transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-heading font-black text-aid-dark/40 mb-2 uppercase tracking-[0.2em]">
              Subtotal
            </label>
            <div className="w-full bg-aid-green/10 border-2 border-aid-green/20 rounded-2xl px-5 py-3 text-aid-dark text-right font-heading font-black text-lg shadow-sm shadow-aid-green/5 animate-in fade-in zoom-in-95 duration-500">
              <span className="text-[10px] font-black text-aid-dark/40 mr-1 uppercase">IDR</span>
              {subtotal.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
