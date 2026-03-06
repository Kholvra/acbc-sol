'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useSignMessage } from 'wagmi';
import { signIn } from 'next-auth/react';
import WalletWrapper from '~/components/providers/wallet-wrapper';
import Button from '~/components/ui/button';
import { Radio } from 'lucide-react';
import { toast } from 'sonner';

const SignInPage: React.FC = () => {
  const { isConnected, address, isConnecting } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Track if we have already triggered auth for the current address to prevent loops
  const authAttemptedRef = useRef<string | null>(null);

  const buildMessage = (addr: string, timestamp: number) => {
    return [
      'AidBeacon Authentication',
      '',
      'Sign this message to authenticate.',
      `Wallet: ${addr}`,
      `Timestamp: ${timestamp}`,
    ].join('\n');
  };

  const handleSignIn = useCallback(async (walletAddress: string) => {
    if (!walletAddress) {
      toast.error('No wallet address');
      return;
    }

    setIsAuthenticating(true);

    try {
      const timestamp = Date.now();
      const message = buildMessage(walletAddress, timestamp);
      const signature = await signMessageAsync({ message });

      const result = await signIn('credentials', {
        message,
        signature,
        address: walletAddress,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success('Successfully authenticated!');
      router.push('/dashboard');

    } catch (error) {
      console.error('Sign in error:', error);
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          toast.error('Signature cancelled');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Authentication failed');
      }
      setIsAuthenticating(false);
    }
  }, [signMessageAsync, router]);

  // auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && address && !isAuthenticating && authAttemptedRef.current !== address) {
      authAttemptedRef.current = address;
      void handleSignIn(address);
    }
    
    if (!isConnected) {
      authAttemptedRef.current = null;
    }
  }, [isConnected, address, isAuthenticating, handleSignIn]);

  if (isConnecting || isAuthenticating) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white px-4" data-ock-theme="custom">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-aid-dark/5 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-aid-green text-white">
              <Radio size={40} />
            </div>
          </div>

          <h1 className="text-3xl font-heading font-black text-aid-dark mb-2">
            {isConnecting ? 'Connecting...' : 'Authenticating...'}
          </h1>
          <p className="text-gray-500 mb-8">
            {isConnecting 
              ? 'Please approve the connection in your wallet' 
              : 'Please sign the message in your wallet'}
          </p>

          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aid-green" />
          </div>

          <p className="mt-6 text-sm text-gray-400">
            This action is free and doesn&apos;t require gas fees
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white px-4" data-ock-theme="custom">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-aid-dark/5 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-aid-green text-white">
            <Radio size={40} />
          </div>
        </div>

        <h1 className="text-3xl font-heading font-black text-aid-dark mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-500 mb-8">
          Connect your wallet to manage your campaigns and aid efforts.
        </p>

        <div className="space-y-4">
          {isConnected && address ? (
            <>
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Wallet connected: <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                </p>
              </div>
              <Button 
                onClick={() => void handleSignIn(address)} 
                className="w-full"
                size="lg"
              >
                Sign Message to Login
              </Button>
            </>
          ) : (
            <WalletWrapper className="w-full justify-center" text="Connect Wallet" />
          )}
        </div>

        <div className="mt-6 text-sm text-gray-400">
          By connecting, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
