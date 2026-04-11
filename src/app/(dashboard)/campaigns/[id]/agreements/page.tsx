'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText } from 'lucide-react';
import { api } from '~/trpc/react';
import TikTokLayout from '~/components/layout/tiktok-layout';
import Button from '~/components/ui/button';
import { EmptyState } from '~/components/ui/empty-state';
import { AgreementList } from '~/components/agreements/agreement-list';
import { AgreementListSkeleton } from '~/components/agreements/agreement-list-skeleton';

interface AgreementsPageProps {
  params: Promise<{ id: string }>;
}

export default function AgreementsPage({ params }: AgreementsPageProps) {
  const router = useRouter();
  const { id: campaignId } = use(params);

  const {
    data: agreements,
    isLoading,
    error,
  } = api.agreement.list.useQuery(
    { campaignId },
    {
      enabled: !!campaignId,
      retry: 2,
      staleTime: 30 * 1000,
    }
  );

  const handleCreateNew = () => {
    router.push(`/campaigns/${campaignId}/agreements/new`);
  };

  return (
    <TikTokLayout>
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 min-h-screen">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading font-black text-aid-dark mb-3 tracking-tight">
              Purchase Agreements
            </h1>
            <p className="text-aid-dark/60 font-medium max-w-2xl">
              Manage purchase agreements for this campaign. All agreements require admin
              approval before proceeding.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreateNew}
            leftIcon={<Plus size={20} />}
          >
            New Agreement
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {isLoading ? (
            <AgreementListSkeleton />
          ) : error ? (
            <EmptyState
              title="Error Loading Agreements"
              description={error.message || 'Something went wrong. Please try again.'}
              icon={<FileText className="w-12 h-12 text-red-300 mx-auto mb-4" />}
              action={{
                label: 'Try Again',
                onClick: () => window.location.reload(),
              }}
            />
          ) : agreements && agreements.length > 0 ? (
            <AgreementList agreements={agreements} />
          ) : (
            <EmptyState
              title="No Agreements Yet"
              description="Create your first purchase agreement to start tracking campaign expenses."
              icon={<FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />}
              action={{
                label: 'Create First Agreement',
                onClick: handleCreateNew,
              }}
            />
          )}
        </div>
      </div>
    </TikTokLayout>
  );
}
