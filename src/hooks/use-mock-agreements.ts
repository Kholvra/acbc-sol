'use client';

import { useState, useEffect } from 'react';
import { mockAgreements, mockPendingAgreements } from '~/mocks/agreements';
import type { AgreementFormData } from '~/components/agreements/schemas';

export function useMockAgreements(campaignAddress: string) {
  const [data, setData] = useState<typeof mockPendingAgreements>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      // Filter mock data by campaignAddress
      const filtered = mockPendingAgreements.filter(a => a.campaignAddress === campaignAddress);
      setData(filtered);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [campaignAddress]);

  return { data, isLoading };
}

export function useMockCreateAgreement() {
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<{ id: string } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (formData: AgreementFormData) => {
    setIsPending(true);
    setError(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Simulate successful creation
      const newAgreement = {
        id: `agr_mock_${Date.now()}`,
        ...formData,
      };
      setData({ id: newAgreement.id });
      console.log('Mock create agreement:', newAgreement);
      return newAgreement;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, data, error };
}
