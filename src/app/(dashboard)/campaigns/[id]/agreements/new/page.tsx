'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgreementForm } from '~/components/agreements/agreement-form';
import type { AgreementFormData } from '~/components/agreements/schemas';

interface NewAgreementPageProps {
  params: {
    id: string;
  };
}

export default function NewAgreementPage({ params }: NewAgreementPageProps) {
  const router = useRouter();
  const campaignId = params.id;
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleSubmit = async (data: AgreementFormData) => {
    // Phase 1: Just log the data
    console.log('=== AGREEMENT SUBMITTED ===');
    console.log('Campaign ID:', campaignId);
    console.log(JSON.stringify(data, null, 2));

    // Show success message (Phase 1 - using alert, will use toast later)
    alert('Agreement created successfully!\n\nCheck console for submitted data.');
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    router.back();
  };

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Purchase Agreement</h1>
          <p className="text-slate-400">
            Initiate a new purchase agreement for campaign. This will be sent for approval after submission.
          </p>
        </div>

        <AgreementForm
          campaignId={campaignId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCancelConfirm(false)}
          />

          {/* Modal */}
          <div className="relative bg-neutral-800 border border-neutral-700 rounded-2xl p-6 max-w-md mx-4 shadow-2xl w-full">
            <h3 className="text-xl font-bold text-white mb-2">Cancel Form?</h3>
            <p className="text-slate-400 mb-6">
              All unsaved data will be lost. Are you sure you want to cancel?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
