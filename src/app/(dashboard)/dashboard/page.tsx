'use client';

import React, { useState, useEffect } from 'react';
import CampaignCreationModal from '~/components/campaign/campaign-creation-modal';
import CampaignCard from '~/components/campaign/campaign-card';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FACTORY_ADDRESS, FACTORY_ABI, CAMPAIGN_ABI } from '~/constants/contracts';
import { Loader2, Compass } from 'lucide-react';
import TikTokLayout from '~/components/layout/tiktok-layout';
import Button from '~/components/ui/button';
import { fetchJSONFromIPFS } from '~/utils/pinata';
import { isCampaignExpired } from '~/utils/date';
import { api } from '~/trpc/react';

const REFETCH_INTERVAL_MS = 5000;
const AUTH_REDIRECT_DELAY_MS = 500;

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected, isConnecting } = useAccount();
  const { status } = useSession();
  const router = useRouter();

  // check if user exists in DB
  const { data: profile, isLoading: isProfileLoading } = api.user.getProfile.useQuery(undefined, {
    enabled: status === 'authenticated',
    retry: false,
  });

  const [expiredAddresses, setExpiredAddresses] = useState<Set<string>>(new Set());
  const [isCheckingExpiration, setIsCheckingExpiration] = useState(true);

  const { data: campaignAddresses, isLoading: isCampaignsLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getCampaigns',
    query: {
        refetchInterval: REFETCH_INTERVAL_MS,
    }
  });

  const { data: campaignsData } = useReadContracts({
    contracts: campaignAddresses?.flatMap((addr) => [
      { address: addr, abi: CAMPAIGN_ABI, functionName: 'isActive' },
      { address: addr, abi: CAMPAIGN_ABI, functionName: 'metadata' }
    ]) ?? [],
    query: {
        enabled: !!campaignAddresses && campaignAddresses.length > 0,
        refetchInterval: REFETCH_INTERVAL_MS
    }
  });

  useEffect(() => {
      const checkExpirations = async () => {
          if (!campaignAddresses || !campaignsData) return;

          setIsCheckingExpiration(true);
          const expired = new Set<string>();
          const promises = campaignAddresses.map(async (addr, index) => {
              const activeResult = campaignsData[index * 2];
              const metaResult = campaignsData[index * 2 + 1];

              if (activeResult?.status === 'success' && activeResult.result === false) return;

              if (metaResult?.status === 'success') {
                  const meta = metaResult.result as unknown as Record<string, unknown>;
                  const descriptionIPFS = meta[1] as string | undefined;

                  if (descriptionIPFS?.startsWith('ipfs://')) {
                      try {
                          const data = await fetchJSONFromIPFS(descriptionIPFS) as Record<string, unknown> | null;
                          const props = data?.properties;
                          if (props && typeof props === 'object' && 'endDate' in props) {
                               const typedProps = props as Record<string, unknown>;
                               if (typedProps.endDate && typeof typedProps.endDate === 'string' && isCampaignExpired(typedProps.endDate)) {
                                   expired.add(addr);
                               }
                          }
                      } catch (e) {
                          console.error("Failed to check expiration for", addr, e);
                      }
                  }
              }
          });

          await Promise.all(promises);
          setExpiredAddresses(expired);
          setIsCheckingExpiration(false);
      };

      void checkExpirations();
  }, [campaignAddresses, campaignsData]);

  const filteredCampaigns = campaignAddresses?.filter((addr, index) => {
     if (!campaignsData) return false;
     const activeResult = campaignsData[index * 2];
     if (activeResult?.status === 'success' && activeResult.result === false) return false;
     if (expiredAddresses.has(addr)) return false; 
     return true;
  });

  useEffect(() => {
    // debounce redirect to avoid race conditions during session transitions
    if (status === 'unauthenticated') {
      const timer = setTimeout(() => {
        router.push('/sign-in');
      }, AUTH_REDIRECT_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [status, router, profile]);

  // show loading while connecting, session loading, or profile loading
  if (isConnecting || status === 'loading' || isProfileLoading) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-aid-offwhite">
            <Loader2 className="animate-spin text-aid-green" size={48} />
        </div>
      );
  }

  // redirect to sign-in if unauthenticated or session exists but no profile in DB
  if (status === 'unauthenticated' || (status === 'authenticated' && profile === null)) {
      router.push('/sign-in');
      return null;
  }

  // don't render if not authenticated - avoid redirect loops
  if (status !== 'authenticated' || !isConnected) {
      return null;
  }

  return (
    <TikTokLayout onOpenCreate={() => setIsModalOpen(true)}>
        <div className="relative h-screen w-full overflow-hidden">
            <div className="relative z-10 h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar bg-transparent">
                {isCampaignsLoading || isCheckingExpiration ? ( 
                    <div className="h-full w-full flex items-center justify-center snap-start">
                        <div className="text-center">
                            <Loader2 className="animate-spin text-aid-green mx-auto mb-4" size={48} />
                            <p className="font-heading font-bold text-aid-dark/60">Fetching Relief Efforts...</p>
                        </div>
                    </div>
                ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
                    [...filteredCampaigns].reverse().map((address) => (
                        <div key={address} className="h-full w-full snap-start relative flex justify-center bg-transparent md:py-8">
                           <div className="w-full h-full md:max-w-[450px] relative">
                               <CampaignCard address={address} />
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
