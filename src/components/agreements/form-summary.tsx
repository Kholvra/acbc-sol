'use client';

import type { AgreementFormData } from './schemas';

interface FormSummaryProps {
  formData: AgreementFormData;
}

export function FormSummary({ formData }: FormSummaryProps) {
  const totalAmount = formData.items.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity),
    0
  );

  const totalItems = formData.items.length;
  const totalQuantity = formData.items.reduce((sum, item) => sum + item.quantity, 0);

  const categoryLabels: Record<string, string> = {
    MEDICAL: 'Medis',
    CONSTRUCTION: 'Material Bangunan',
    GROCERIES: 'Kebutuhan Pokok',
    TRANSPORTATION: 'Transportasi',
    UTILITIES: 'Utilitas',
    OTHER: 'Lainnya',
  };

  return (
    <div className="rounded-[32px] p-8 bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-aid-green/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
      <h3 className="text-2xl font-heading font-black text-aid-dark mb-8 relative z-10 tracking-tight">Review Summary</h3>

      <div className="space-y-8 relative z-10">
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white/40 p-5 rounded-2xl border border-white/60 shadow-sm">
            <p className="text-[10px] font-heading font-black text-aid-dark/30 mb-2 uppercase tracking-[0.2em]">Vendor</p>
            <p className="font-heading font-black text-aid-dark text-lg">{formData.vendorName}</p>
          </div>
          <div className="bg-white/40 p-5 rounded-2xl border border-white/60 shadow-sm">
            <p className="text-[10px] font-heading font-black text-aid-dark/30 mb-2 uppercase tracking-[0.2em]">Category</p>
            <p className="font-heading font-black text-aid-dark text-lg">{categoryLabels[formData.category] ?? formData.category}</p>
          </div>
        </div>

        <div className="bg-white/40 rounded-2xl border border-white/60 p-6 shadow-sm">
          <p className="text-[10px] font-heading font-black text-aid-dark/30 mb-4 uppercase tracking-[0.2em]">Items List</p>
          <ul className="space-y-3">
            {formData.items.map((item, i) => (
              <li key={i} className="flex justify-between items-center group transition-all">
                <div className="flex flex-col">
                    <span className="font-heading font-black text-aid-dark text-sm">{item.itemName}</span>
                    <span className="text-[10px] font-bold text-aid-dark/40 uppercase tracking-widest">Qty: {item.quantity} units</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="font-heading font-black text-aid-dark">
                        <span className="text-[10px] text-aid-dark/30 mr-1">IDR</span>
                        {(item.unitPrice * item.quantity).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-aid-dark/30 font-bold">Rp {item.unitPrice.toLocaleString('id-ID')} / unit</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white/40 p-5 rounded-2xl border border-white/60 shadow-sm">
            <p className="text-[10px] font-heading font-black text-aid-dark/30 mb-2 uppercase tracking-[0.2em]">Start Date</p>
            <p className="font-heading font-black text-aid-dark">
              {formData.startDate ? new Date(formData.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
            </p>
          </div>
          <div className="bg-white/40 p-5 rounded-2xl border border-white/60 shadow-sm">
            <p className="text-[10px] font-heading font-black text-aid-dark/30 mb-2 uppercase tracking-[0.2em]">End Date</p>
            <p className="font-heading font-black text-aid-dark">
              {formData.endDate ? new Date(formData.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
            </p>
          </div>
        </div>

        <div className="bg-aid-green/10 border-2 border-aid-green/20 rounded-[24px] p-6 shadow-lg shadow-aid-green/5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-heading font-black text-aid-dark/40 uppercase tracking-[0.2em]">Agreement Statistics</span>
            <div className="flex gap-2">
                <span className="bg-white/80 px-3 py-1 rounded-full text-[10px] font-black text-aid-dark shadow-sm uppercase tracking-wider">{totalItems} Types</span>
                <span className="bg-white/80 px-3 py-1 rounded-full text-[10px] font-black text-aid-dark shadow-sm uppercase tracking-wider">{totalQuantity} Units</span>
            </div>
          </div>
          
          <div className="flex justify-between items-end pt-4 border-t border-aid-green/20">
            <span className="font-heading font-black text-aid-dark/40 uppercase tracking-[0.1em] text-xs pb-1">Total Agreement Value</span>
            <div className="text-right">
                <span className="block text-[10px] font-black text-aid-dark/30 uppercase tracking-[0.2em] mb-1">Estimated Total Cost</span>
                <span className="text-3xl font-heading font-black text-aid-dark tracking-tighter">
                  <span className="text-sm mr-1">IDR</span>
                  {totalAmount.toLocaleString('id-ID')}
                </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
