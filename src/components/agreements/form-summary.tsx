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
    <div className="rounded-2xl p-6 bg-neutral-800 border border-neutral-700">
      <h3 className="text-xl font-bold text-white mb-6">Review Summary</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Vendor</p>
            <p className="font-bold text-white">{formData.vendorName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Category</p>
            <p className="font-bold text-white">{categoryLabels[formData.category] ?? formData.category}</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="text-sm text-slate-400 mb-2">Items</p>
          <ul className="space-y-2">
            {formData.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-white">{item.itemName} × {item.quantity}</span>
                <span className="text-slate-300 font-mono">
                  Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400 mb-1">Start Date</p>
            <p className="font-bold text-white">
              {formData.startDate ? new Date(formData.startDate).toLocaleDateString('id-ID') : '-'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">End Date</p>
            <p className="font-bold text-white">
              {formData.endDate ? new Date(formData.endDate).toLocaleDateString('id-ID') : '-'}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-purple-500/20 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Total Items</span>
            <span className="text-lg font-bold text-white">{totalItems} item(s)</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Total Quantity</span>
            <span className="text-lg font-bold text-white font-mono">{totalQuantity} units</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-white/10">
            <span className="text-sm font-bold text-purple-400">Total Agreement Value</span>
            <span className="text-2xl font-bold text-purple-400">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
