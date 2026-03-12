'use client';

import type { AgreementFormData } from './schemas';
import { FormSection } from '~/components/ui/form-section';
import { SummaryCard } from '~/components/ui/summary-card';

interface FormSummaryProps {
  formData: AgreementFormData;
}

// Helper to parse unitPrice that might be a formatted string
const parseUnitPrice = (val: unknown): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    return parseFloat(val.replace(/\./g, '')) || 0;
  }
  return 0;
};

export function FormSummary({ formData }: FormSummaryProps) {
  const totalAmount = formData.items.reduce(
    (sum, item) => sum + (parseUnitPrice(item.unitPrice) * item.quantity),
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
        <div className="grid grid-cols-2 gap-8">
          <SummaryCard label="Vendor" value={formData.vendorName} />
          <SummaryCard
            label="Category"
            value={categoryLabels[formData.category] ?? formData.category}
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <p className="text-xs font-heading font-bold text-gray-500 mb-4">
            Items List
          </p>
          <ul className="space-y-3">
            {formData.items.map((item, i) => {
              const unitPrice = parseUnitPrice(item.unitPrice);
              return (
                <li
                  key={i}
                  className="flex justify-between items-center group transition-all"
                >
                  <div className="flex flex-col">
                    <span className="font-heading font-bold text-aid-dark text-sm">
                      {item.itemName}
                    </span>
                    <span className="text-xs text-gray-500">
                      Qty: {item.quantity} units
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-heading font-bold text-aid-dark">
                      <span className="text-xs text-gray-400 mr-1">IDR</span>
                      {(unitPrice * item.quantity).toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-gray-400">
                      Rp {unitPrice.toLocaleString('id-ID')} / unit
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

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

        <div className="bg-aid-green/10 border border-aid-green/30 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-heading font-bold text-gray-600">
              Agreement Statistics
            </span>
            <div className="flex gap-2">
              <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-aid-dark shadow-sm">
                {totalItems} Types
              </span>
              <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-aid-dark shadow-sm">
                {totalQuantity} Units
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end pt-4 border-t border-aid-green/20">
            <span className="font-heading font-bold text-gray-600 text-sm pb-1">
              Total Agreement Value
            </span>
            <div className="text-right">
              <span className="block text-xs font-bold text-gray-500 mb-1">
                Estimated Total Cost
              </span>
              <span className="text-3xl font-heading font-bold text-aid-dark">
                <span className="text-lg mr-1">IDR</span>
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
