'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { AgreementForm } from '~/components/agreements/agreement-form';
import type { AgreementFormData } from '~/components/agreements/schemas';
import TikTokLayout from '~/components/layout/tiktok-layout';
import { toast } from 'sonner';
import Button from '~/components/ui/button';

interface NewAgreementPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function NewAgreementPage({ params }: NewAgreementPageProps) {
  const router = useRouter();
  const { id: campaignId } = use(params);

  const handleSubmit = async (data: AgreementFormData) => {
    // phase 1: log data
    console.log('=== AGREEMENT SUBMITTED ===');
    console.log('Campaign ID:', campaignId);
    console.log(JSON.stringify(data, null, 2));

    toast.success('Agreement created successfully!', {
        description: 'Check console for submitted data.'
    });
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
            Initiate a new purchase agreement for campaign. This will be sent for approval after submission.
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
