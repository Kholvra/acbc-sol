'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useSignMessage } from 'wagmi';
import { signIn, useSession } from 'next-auth/react';
import WalletWrapper from '~/components/providers/wallet-wrapper';
import Button from '~/components/ui/button';
import { Radio } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '~/trpc/react';

const buildAuthMessage = (address: string, timestamp: number): string => {
  return [
    'AidBeacon Authentication',
    '',
    'Sign this message to authenticate.',
    `Wallet: ${address}`,
    `Timestamp: ${timestamp}`,
  ].join('\n');
};

const SignInPage: React.FC = () => {
  const { isConnected, address, isConnecting } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { status } = useSession();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // tRPC utils for invalidation
  const utils = api.useUtils();

  // check if user exists in DB
  const { data: profile, isLoading: isProfileLoading } = api.user.getProfile.useQuery(undefined, {
    enabled: status === 'authenticated' && isConnected,
    retry: false,
    staleTime: 0, // always refetch when enabled
  });

  // track which address we've already attempted auth for
  const lastAuthAttemptAddress = useRef<string | null>(null);

  const handleSignIn = useCallback(async (walletAddress: string) => {
    // skip if no address or already authenticated with profile
    if (!walletAddress || (status === 'authenticated' && profile)) {
      return;
    }

    setIsAuthenticating(true);

    try {
      const timestamp = Date.now();
      const message = buildAuthMessage(walletAddress, timestamp);
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

      // invalidate profile query to ensure fresh data
      await utils.user.getProfile.invalidate();

      router.push('/dashboard');
      router.refresh();

    } catch (error) {
      console.error('Sign in error:', error);
      const message = error instanceof Error ? error.message : 'Authentication failed';
      
      if (message.includes('User rejected')) {
        toast.error('Signature cancelled');
      } else {
        toast.error(message);
      }
      
      setIsAuthenticating(false);
      // don't reset ref - let user manually retry via button
    }
  }, [signMessageAsync, router, status, profile, utils]);

  // auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && address && !isAuthenticating && status === 'unauthenticated' && lastAuthAttemptAddress.current !== address) {
      lastAuthAttemptAddress.current = address;
      void handleSignIn(address);
    }

    if (!isConnected) {
      lastAuthAttemptAddress.current = null;
    }
  }, [isConnected, address, isAuthenticating, status]);

  // redirect to dashboard if authenticated and profile exists
  useEffect(() => {
    if (status === 'authenticated' && profile) {
      router.push('/dashboard');
    }
  }, [status, profile, router]);

  // show loading only during wallet connection or profile check
  if (isConnecting || (status === 'authenticated' && isProfileLoading)) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white px-4" data-ock-theme="custom">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-aid-dark/5 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-aid-green text-white">
              <Radio size={40} />
            </div>
          </div>

          <h1 className="text-3xl font-heading font-black text-aid-dark mb-2">
            {isConnecting ? 'Connecting...' : 'Loading...'}
          </h1>
          <p className="text-gray-500 mb-8">
            {isConnecting
              ? 'Please approve the connection in your wallet'
              : 'Please wait while we load your profile'}
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

  const getButtonText = (): string => {
    if (isAuthenticating) return 'Signing...';
    // show "Sign Message" if not authenticated OR authenticated but no profile (re-auth needed)
    if (status === 'authenticated' && profile) return 'Already Signed In';
    return 'Sign Message to Login';
  };

  const getButtonDisabled = (): boolean => {
    if (isAuthenticating) return true;
    if (status === 'authenticated' && profile) return true;
    return false;
  };

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
                disabled={getButtonDisabled()}
              >
                {getButtonText()}
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
