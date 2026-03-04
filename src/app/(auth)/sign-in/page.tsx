'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import WalletWrapper from '~/components/providers/wallet-wrapper';
import { Radio } from 'lucide-react';
import Navbar from '~/components/layout/navbar';

const LoginPage: React.FC = () => {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-aid-offwhite px-4 relative overflow-hidden pt-20">
         {/* Background Aurora Effect */}
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-aid-green/30 blur-[120px] rounded-full"></div>
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-aid-yellow/20 blur-[100px] rounded-full"></div>
         </div>

         <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-aid-dark/5 text-center relative z-10 scale-105 transform transition-all duration-500">
            <div className="flex justify-center mb-8">
              <div className="p-6 rounded-full bg-aid-green text-white shadow-xl shadow-aid-green/20 animate-bounce-slow">
                  <Radio size={48} />
              </div>
            </div>
            
            <h1 className="text-4xl font-heading font-black text-aid-dark mb-3 tracking-tight">Welcome Back</h1>
            <p className="text-aid-dark/60 mb-10 text-lg leading-relaxed">Connect your wallet to manage your campaigns and aid efforts.</p>

            <div className="flex justify-center w-full px-2">
               <WalletWrapper className="w-full justify-center py-4 text-xl font-bold bg-aid-dark hover:bg-aid-green transition-all shadow-lg hover:shadow-xl rounded-2xl" />
            </div>

            <div className="mt-10 text-xs font-bold text-aid-dark/30 uppercase tracking-widest">
              Secured by Base Blockchain
            </div>
            
            <div className="mt-4 text-[10px] text-aid-dark/40 leading-relaxed px-4">
              By connecting, you agree to our <span className="underline cursor-pointer hover:text-aid-dark transition-colors">Terms of Service</span> and <span className="underline cursor-pointer hover:text-aid-dark transition-colors">Privacy Policy</span>.
            </div>
         </div>
      </div>
    </>
  );
};

export default LoginPage;
