'use client';

import { formatIDR } from '~/lib/formatters';
import type { RouterOutputs } from '~/trpc/react';

type Agreement = RouterOutputs['agreement']['list'][number];

interface AgreementListProps {
  agreements: Agreement[];
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const categoryLabels: Record<string, string> = {
  MEDICAL: 'Medical',
  CONSTRUCTION: 'Construction',
  GROCERIES: 'Groceries',
  TRANSPORTATION: 'Transportation',
  UTILITIES: 'Utilities',
  OTHER: 'Other',
};

export function AgreementList({ agreements }: AgreementListProps) {
  return (
    <div className="space-y-4">
      {agreements.map((agreement) => (
        <div
          key={agreement.id}
          className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-heading font-bold text-lg text-aid-dark">
                  {agreement.vendorName}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[agreement.status]}`}
                >
                  {statusLabels[agreement.status]}
                </span>
              </div>
              <p className="text-sm text-aid-dark/60 mb-1">
                {categoryLabels[agreement.category] ?? agreement.category}
              </p>
              <p className="text-sm text-aid-dark/60">
                {new Date(agreement.startDate).toLocaleDateString('id-ID')} →{' '}
                {new Date(agreement.endDate).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div className="text-right">
              <p className="font-heading font-bold text-xl text-aid-dark">
                {formatIDR(Number(agreement.totalAmount))}
              </p>
              <p className="text-xs text-aid-dark/40">
                Created {new Date(agreement.createdAt).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
