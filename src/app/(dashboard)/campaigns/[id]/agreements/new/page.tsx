'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { TRPCClientError } from '@trpc/client';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';
import { toast } from 'sonner';
import { api } from '~/trpc/react';
import { AgreementForm } from '~/components/agreements/agreement-form';
import type { AgreementFormData } from '~/components/agreements/schemas';
import TikTokLayout from '~/components/layout/tiktok-layout';

interface TRPCErrorShape {
  code?: TRPC_ERROR_CODE_KEY;
  message?: string;
}

function isTRPCError(error: unknown): error is { data?: TRPCErrorShape } {
  return (
    error instanceof TRPCClientError ||
    (typeof error === 'object' && error !== null && 'data' in error)
  );
}

interface NewAgreementPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function NewAgreementPage({ params }: NewAgreementPageProps) {
  const router = useRouter();
  const { id: campaignId } = use(params);

  const utils = api.useUtils();

  const createMutation = api.agreement.create.useMutation({
    onSuccess: async () => {
      // Invalidate list cache before redirect
      await utils.agreement.list.invalidate({ campaignId });
      toast.success('Agreement created successfully!');
      router.push(`/campaigns/${campaignId}/agreements`);
    },
    onError: (error) => {
      if (isTRPCError(error)) {
        const errorCode = error.data?.code;
        const message = error.data?.message ?? 'Failed to create agreement';

        if (errorCode === 'FORBIDDEN') {
          toast.error('You do not have permission to create agreements for this campaign.');
        } else if (errorCode === 'NOT_FOUND') {
          toast.error('Campaign not found.');
        } else if (errorCode === 'BAD_REQUEST') {
          toast.error(message);
        } else {
          toast.error(message);
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    },
  });

  const handleSubmit = async (data: AgreementFormData) => {
    try {
      // Transform form data (strings) to API format (Dates)
      const transformedData = {
        campaignId,
        vendorName: data.vendorName,
        vendorAddress: undefined, // Not in form, backend handles as optional
        category: data.category,
        items: data.items.map((item) => ({
          itemName: item.itemName,
          specifications: item.specifications,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
        startDate: new Date(data.startDate), // String → Date
        endDate: new Date(data.endDate), // String → Date
        paymentTerms: data.paymentTerms,
      };

      await createMutation.mutateAsync(transformedData);
    } catch {
      // Error handled by mutation's onError
      // Stay on form so user can retry
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <TikTokLayout>
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 min-h-screen">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-heading font-black text-aid-dark mb-3 tracking-tight">
            Create Purchase Agreement
          </h1>
          <p className="text-aid-dark/60 font-medium max-w-2xl">
            Initiate a new purchase agreement for campaign. This will be sent for approval
            after submission.
          </p>
        </div>

        <div className="mb-24">
          <AgreementForm
            campaignId={campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </TikTokLayout>
  );
}
