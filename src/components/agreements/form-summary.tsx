'use client';

import type { AgreementFormData } from './schemas';
import { FormSection } from '~/components/ui/form-section';
import { SummaryCard } from '~/components/ui/summary-card';

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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <FormSection title="Review Summary">
      <div className="space-y-8">
        {/* Vendor & Category */}
        <div className="grid grid-cols-2 gap-8">
          <SummaryCard label="Vendor" value={formData.vendorName} />
          <SummaryCard
            label="Category"
            value={categoryLabels[formData.category] ?? formData.category}
          />
        </div>

        {/* Items List */}
        <div className="bg-white/40 rounded-2xl border border-white/60 p-6 shadow-sm">
          <p className="text-[10px] font-heading font-black text-aid-dark/30 mb-4 uppercase tracking-[0.2em]">
            Items List
          </p>
          <ul className="space-y-3">
            {formData.items.map((item, i) => (
              <li
                key={i}
                className="flex justify-between items-center group transition-all"
              >
                <div className="flex flex-col">
                  <span className="font-heading font-black text-aid-dark text-sm">
                    {item.itemName}
                  </span>
                  <span className="text-[10px] font-bold text-aid-dark/40 uppercase tracking-widest">
                    Qty: {item.quantity} units
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-heading font-black text-aid-dark">
                    <span className="text-[10px] text-aid-dark/30 mr-1">IDR</span>
                    {(item.unitPrice * item.quantity).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-aid-dark/30 font-bold">
                    Rp {item.unitPrice.toLocaleString('id-ID')} / unit
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-8">
          <SummaryCard
            label="Start Date"
            value={formData.startDate ? formatDate(formData.startDate) : '-'}
          />
          <SummaryCard
            label="End Date"
            value={formData.endDate ? formatDate(formData.endDate) : '-'}
          />
        </div>

        {/* Total Amount - Highlight */}
        <div className="bg-aid-green/10 border-2 border-aid-green/20 rounded-[24px] p-6 shadow-lg shadow-aid-green/5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-heading font-black text-aid-dark/40 uppercase tracking-[0.2em]">
              Agreement Statistics
            </span>
            <div className="flex gap-2">
              <span className="bg-white/80 px-3 py-1 rounded-full text-[10px] font-black text-aid-dark shadow-sm uppercase tracking-wider">
                {totalItems} Types
              </span>
              <span className="bg-white/80 px-3 py-1 rounded-full text-[10px] font-black text-aid-dark shadow-sm uppercase tracking-wider">
                {totalQuantity} Units
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end pt-4 border-t border-aid-green/20">
            <span className="font-heading font-black text-aid-dark/40 uppercase tracking-[0.1em] text-xs pb-1">
              Total Agreement Value
            </span>
            <div className="text-right">
              <span className="block text-[10px] font-black text-aid-dark/30 uppercase tracking-[0.2em] mb-1">
                Estimated Total Cost
              </span>
              <span className="text-3xl font-heading font-black text-aid-dark tracking-tighter">
                <span className="text-sm mr-1">IDR</span>
                {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
}

export default FormSummary;
