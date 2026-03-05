'use client';

import React, { useState, useEffect } from 'react';
import CampaignCreationModal from '~/components/campaign/campaign-creation-modal';
import CampaignCard from '~/components/campaign/campaign-card';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { useRouter } from 'next/navigation';
import { FACTORY_ADDRESS, FACTORY_ABI, CAMPAIGN_ABI } from '~/constants/contracts';
import { Loader2 } from 'lucide-react';
import TikTokLayout from '~/components/layout/tiktok-layout';
import Button from '~/components/ui/button';
import { fetchJSONFromIPFS } from '~/utils/pinata';
import { isCampaignExpired } from '~/utils/date';

const DashboardPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected, isConnecting } = useAccount();
  const router = useRouter();

  const [expiredAddresses, setExpiredAddresses] = useState<Set<string>>(new Set());
  const [isCheckingExpiration, setIsCheckingExpiration] = useState(true);

  const { data: campaignAddresses, isLoading: isCampaignsLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getCampaigns',
    query: {
        refetchInterval: 5000, 
    }
  });

  const { data: campaignsData } = useReadContracts({
    // @ts-expect-error - Wagmi contracts array type is complex
    contracts: campaignAddresses?.flatMap((addr) => [
      { address: addr, abi: CAMPAIGN_ABI, functionName: 'isActive' },
      { address: addr, abi: CAMPAIGN_ABI, functionName: 'metadata' }
    ]) ?? [],
    query: {
        enabled: !!campaignAddresses && campaignAddresses.length > 0,
        refetchInterval: 5000
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
                  const meta = metaResult.result as Record<string, unknown>;
                  const descriptionIPFS = meta[1] as string | undefined;

                  if (descriptionIPFS && descriptionIPFS.startsWith('ipfs://')) {
                      try {
                          const data = await fetchJSONFromIPFS(descriptionIPFS);
                          if (data && typeof data === 'object' && 'properties' in data && data.properties && typeof data.properties === 'object' && 'endDate' in data.properties) {
                               const properties = data.properties as Record<string, unknown>;
                               if (properties.endDate && typeof properties.endDate === 'string' && isCampaignExpired(properties.endDate)) {
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
    if (!isConnecting && !isConnected) {
        router.push('/sign-in');
    }
  }, [isConnected, isConnecting, router]);

  if (isConnecting) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-aid-offwhite">
            <Loader2 className="animate-spin text-aid-green" size={48} />
        </div>
      );
  }

  if (!isConnected) return null;

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
                        <div className="w-24 h-24 bg-aid-yellow/20 rounded-full flex items-center justify-center mb-6">
                            <Loader2 className="text-aid-yellow animate-pulse" size={48} />
                        </div>
                        <h3 className="font-heading font-black text-3xl mb-4 text-aid-dark">No campaigns found</h3>
                        <p className="text-aid-dark/60 mb-8 font-body text-lg max-w-sm">There are no active relief efforts at the moment. Be the first to start one!</p>
                        <Button variant="primary" size="lg" onClick={() => setIsModalOpen(true)}>
                            Create First Campaign
                        </Button>
                    </div>
                )}
            </div>
        </div>

      <CampaignCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </TikTokLayout>
  );
};

export default DashboardPage;
