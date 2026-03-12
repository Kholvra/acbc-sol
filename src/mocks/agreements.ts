import type { AgreementFormData, AgreementWithMeta } from '~/components/agreements/schemas';

export const mockAgreements: AgreementFormData[] = [
  {
    campaignId: 'cmp_123',
    vendorName: 'Apotek K24',
    category: 'MEDICAL',
    items: [
      {
        itemName: 'Paracetamol 500mg',
        specifications: 'Box isi 100 tablet',
        unitPrice: 50000,
        quantity: 10,
      },
      {
        itemName: 'Termometer Digital',
        specifications: 'Omron MC-246',
        unitPrice: 150000,
        quantity: 2,
      },
    ],
    startDate: new Date().toISOString().split('T')[0] || '',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    paymentTerms: 'FULL_PAYMENT',
  },
  {
    campaignId: 'cmp_123',
    vendorName: 'Toko Bangunan Jaya',
    category: 'CONSTRUCTION',
    items: [
      {
        itemName: 'Semen 50kg',
        specifications: 'Semen Gresik',
        unitPrice: 65000,
        quantity: 20,
      },
      {
        itemName: 'Pasir',
        specifications: '1 truk',
        unitPrice: 300000,
        quantity: 1,
      },
    ],
    startDate: new Date().toISOString().split('T')[0] || '',
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    paymentTerms: 'FULL_PAYMENT',
  },
];

export const mockPendingAgreements: AgreementWithMeta[] = [
  {
    id: 'agr_001',
    campaignId: 'cmp_123',
    vendorName: 'Apotek K24',
    category: 'MEDICAL',
    items: [
      {
        itemName: 'Paracetamol 500mg',
        specifications: 'Box isi 100 tablet',
        unitPrice: 50000,
        quantity: 10,
      },
      {
        itemName: 'Termometer Digital',
        specifications: 'Omron MC-246',
        unitPrice: 150000,
        quantity: 2,
      },
    ],
    totalAmount: 800000,
    status: 'PENDING_APPROVAL',
    startDate: new Date().toISOString().split('T')[0] || '',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    paymentTerms: 'FULL_PAYMENT',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
