'use client';

import React, { useState, useEffect } from 'react';
import CampaignCreationModal from '~/components/campaign/campaign-creation-modal';
import CampaignCard from '~/components/campaign/campaign-card';
import { useWallet } from '@solana/wallet-adapter-react';
import { Loader2, Compass } from 'lucide-react';
import TikTokLayout from '~/components/layout/tiktok-layout';
import Button from '~/components/ui/button';
import { isCampaignExpired } from '~/utils/date';
import { api } from '~/trpc/react';

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { connected } = useWallet();

  const {
    data: profile,
    isError: profileError,
  } = api.user.getProfile.useQuery(undefined, {
    enabled: connected,
    retry: false,
    staleTime: 30000,
  });

  const {
    data: campaigns,
    isLoading: isCampaignsLoading,
    isError: campaignsError,
  } = api.campaign.getAllCampaigns.useQuery(undefined, {
    refetchInterval: 10000,
    retry: false,
    staleTime: 30000,
  });

  const [expiredIds, setExpiredIds] = useState<Set<string>>(new Set());
  const [isCheckingExpiration, setIsCheckingExpiration] = useState(true);

  useEffect(() => {
    const checkExpirations = async () => {
      if (!campaigns) return;
      setIsCheckingExpiration(true);
      const expired = new Set<string>();
      for (const campaign of campaigns) {
        if (campaign.endDate && isCampaignExpired(campaign.endDate.toISOString())) {
          expired.add(campaign.id);
        }
      }
      setExpiredIds(expired);
      setIsCheckingExpiration(false);
    };
    void checkExpirations();
  }, [campaigns]);

  const filteredCampaigns = campaigns?.filter((c) => !expiredIds.has(c.id));

  const showDbError = profileError || campaignsError;

  if (!connected) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-aid-offwhite">
        <div className="text-center">
          <p className="font-heading font-bold text-aid-dark/60">Connect wallet to continue</p>
        </div>
      </div>
    );
  }

  return (
    <TikTokLayout onOpenCreate={() => setIsModalOpen(true)}>
      <div className="relative h-screen w-full overflow-hidden">
        {showDbError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-sm font-medium shadow">
            Database unreachable — some features limited
          </div>
        )}
        <div className="relative z-10 h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar bg-transparent">
          {isCampaignsLoading || isCheckingExpiration ? (
            <div className="h-full w-full flex items-center justify-center snap-start">
              <div className="text-center">
                <Loader2 className="animate-spin text-aid-green mx-auto mb-4" size={48} />
                <p className="font-heading font-bold text-aid-dark/60">Fetching Relief Efforts...</p>
              </div>
            </div>
          ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
            [...filteredCampaigns].reverse().map((campaign) => (
              <div key={campaign.id} className="h-full w-full snap-start relative flex justify-center bg-transparent md:py-8">
                <div className="w-full h-full md:max-w-[450px] relative">
                  <CampaignCard campaign={campaign} />
                </div>
              </div>
            ))
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center snap-start text-center p-8">
              {profile?.role === 'CAMPAIGNER' ? (
                <>
                  <div className="w-24 h-24 bg-aid-yellow/20 rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="text-aid-yellow animate-pulse" size={48} />
                  </div>
                  <h3 className="font-heading font-black text-3xl mb-4 text-aid-dark">No campaigns found</h3>
                  <p className="text-aid-dark/60 mb-8 font-body text-lg max-w-sm">There are no active relief efforts at the moment. Be the first to start one!</p>
                  <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>
                    Create First Campaign
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-aid-green/20 rounded-full flex items-center justify-center mb-6">
                    <Compass className="text-aid-green" size={48} />
                  </div>
                  <h3 className="font-heading font-black text-3xl mb-4 text-aid-dark">Welcome, Supporter!</h3>
                  <p className="text-aid-dark/60 font-body text-lg max-w-sm">Browse active campaigns above or explore the Explore page to find causes you&apos;d like to support.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <CampaignCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </TikTokLayout>
  );
};

export default DashboardPage;
