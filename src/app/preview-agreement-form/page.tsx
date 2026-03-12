'use client';

import { AgreementForm } from '~/components/agreements/agreement-form';

export default function PreviewAgreementFormPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-heading font-black text-aid-dark mb-2">
              Create Purchase Agreement
            </h1>
            <p className="text-gray-600">
              Initiate a new purchase agreement for campaign. This will be sent for approval after submission.
            </p>
          </div>
          
          <AgreementForm
            campaignId="preview-campaign-123"
            onCancel={() => console.log('Cancelled')}
            onSubmit={async (data) => {
              console.log('Form submitted:', data);
              alert('Form submitted successfully! Check console for data.');
            }}
          />
        </div>
      </div>
    </div>
  );
}
