'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import WalletWrapper from '~/components/providers/wallet-wrapper';
import { Radio } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white px-4" data-ock-theme="custom">
       <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-aid-dark/5 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-aid-green text-white">
                <Radio size={40} />
            </div>
          </div>
          
          <h1 className="text-3xl font-heading font-black text-aid-dark mb-2">Welcome Back</h1>
          <p className="text-gray-500 mb-8">Connect your wallet to manage your campaigns and aid efforts.</p>

          <div className="flex justify-center">
             <WalletWrapper className="w-full justify-center py-3 text-lg" />
          </div>

          <div className="mt-6 text-sm text-gray-400">
            By connecting, you agree to our Terms of Service and Privacy Policy.
          </div>
       </div>
    </div>
  );
};

export default LoginPage;
