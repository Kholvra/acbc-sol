'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import TikTokLayout from '~/components/layout/tiktok-layout';
import CampaignCreationModal from '~/components/campaign/campaign-creation-modal';
import { KycVerificationCard } from '~/components/kyc/kyc-verification-card';
import WalletWrapper from '~/components/providers/wallet-wrapper';
import { ShieldCheck, User } from 'lucide-react';

const KycPage = () => {
  const { connected } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <TikTokLayout onOpenCreate={() => setIsModalOpen(true)}>
      <div className="overflow-y-auto h-screen pb-24">
        {!connected ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
            <div className="bg-white/50 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <User size={40} />
              </div>
              <h2 className="text-2xl font-bold text-aid-dark mb-2">Guest User</h2>
              <p className="text-gray-600 mb-8">Connect your wallet to verify your identity.</p>
              <WalletWrapper className="w-full bg-aid-dark text-white hover:bg-aid-green transition-all py-3 rounded-xl font-bold shadow-lg" />
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-8 max-w-4xl mx-auto pt-20 md:pt-8 min-h-screen flex flex-col items-center justify-center">
             <div className="w-full mb-8">
               <h1 className="text-3xl font-heading font-black text-aid-dark flex items-center gap-3">
                 <ShieldCheck className="text-aid-green" size={32} />
                 Identity Verification
               </h1>
               <p className="text-gray-500 mt-2 font-medium">Complete your KYC to unlock Campaigner features.</p>
             </div>
             
             <div className="w-full">
                <KycVerificationCard />
             </div>
          </div>
        )}
      </div>
      <CampaignCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </TikTokLayout>
  );
};

export default KycPage;
