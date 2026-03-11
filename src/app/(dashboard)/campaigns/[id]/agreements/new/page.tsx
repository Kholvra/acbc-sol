'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { AgreementForm } from '~/components/agreements/agreement-form';
import type { AgreementFormData } from '~/components/agreements/schemas';
import TikTokLayout from '~/components/layout/tiktok-layout';
import { toast } from 'sonner';

interface NewAgreementPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function NewAgreementPage({ params }: NewAgreementPageProps) {
  const router = useRouter();
  const { id: campaignId } = use(params);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleSubmit = async (data: AgreementFormData) => {
    // Phase 1: Just log the data
    console.log('=== AGREEMENT SUBMITTED ===');
    console.log('Campaign ID:', campaignId);
    console.log(JSON.stringify(data, null, 2));

    // Show success message
    toast.success('Agreement created successfully!', {
        description: 'Check console for submitted data.'
    });
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
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

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all"
            onClick={() => setShowCancelConfirm(false)}
          />

          {/* Modal */}
          <div className="relative bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[32px] p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
             {/* Gradient Accent */}
             <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-400 to-orange-400" />
            
            <h3 className="text-2xl font-heading font-black text-aid-dark mb-3">Cancel Form?</h3>
            <p className="text-aid-dark/60 font-medium mb-8 leading-relaxed">
              All unsaved data will be lost. Are you sure you want to cancel this agreement?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-6 py-4 border-2 border-aid-dark/10 text-aid-dark font-bold rounded-2xl hover:bg-aid-dark/5 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 px-6 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </TikTokLayout>
  );
}
