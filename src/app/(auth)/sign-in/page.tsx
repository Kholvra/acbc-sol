'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { signIn, useSession } from 'next-auth/react';
import WalletWrapper from '~/components/providers/wallet-wrapper';
import { Radio } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '~/trpc/react';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

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
  const { connected, publicKey, signMessage } = useWallet();
  const { status } = useSession();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const utils = api.useUtils();
  const hasRedirectedToDashboard = useRef(false);
  const lastAuthAttemptAddress = useRef<string | null>(null);
  const address = publicKey?.toBase58() ?? null;

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: hasProfileError,
  } = api.user.getProfile.useQuery(undefined, {
    enabled: status === 'authenticated' && !!connected,
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toBase64 = (bytes: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]!);
    }
    return btoa(binary);
  };

  const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout: ${label} took longer than ${ms / 1000}s`)), ms)
      ),
    ]);
  };

  const handleSignIn = useCallback(async (walletAddress: string, attemptNumber = 0) => {
    if (!walletAddress || (status === 'authenticated' && profile)) return;
    if (!signMessage) {
      toast.error('Wallet does not support message signing');
      return;
    }

    setIsAuthenticating(true);

    try {
      const timestamp = Date.now();
      const message = buildAuthMessage(walletAddress, timestamp);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await withTimeout(signMessage(messageBytes), 60000, 'signMessage');

      if (!signatureBytes || signatureBytes.length === 0) {
        throw new Error('Wallet returned an empty signature');
      }

      const signature = toBase64(signatureBytes);
      console.log('[sign-in] signature obtained, calling NextAuth signIn...');

      const result = await withTimeout(
        signIn('credentials', { message, signature, address: walletAddress, redirect: false }),
        30000,
        'NextAuth signIn'
      );

      if (result?.error) {
        throw new Error(result.error);
      }

      console.log('[sign-in] auth successful');
      setRetryCount(0);
      toast.success('Successfully authenticated!');
      await utils.user.getProfile.invalidate();

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Authentication failed';
      console.error('[sign-in] error:', msg);

      const shouldRetry =
        msg.includes('CredentialsSignin') && attemptNumber < MAX_RETRIES;

      if (msg.includes('User rejected') || msg.includes('cancelled')) {
        toast.error('Signature cancelled');
      } else if (shouldRetry) {
        const nextAttempt = attemptNumber + 1;
        setRetryCount(nextAttempt);
        console.log(`[sign-in] retry ${nextAttempt}/${MAX_RETRIES} in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        setIsAuthenticating(false);
        void handleSignIn(walletAddress, nextAttempt);
        return;
      } else if (msg.includes('Timeout')) {
        toast.error('Request timed out. Trying again...');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [signMessage, status, profile, utils]);

  // auto sign-in when wallet connects
  useEffect(() => {
    if (
      connected &&
      address &&
      !isAuthenticating &&
      status === 'unauthenticated' &&
      lastAuthAttemptAddress.current !== address
    ) {
      lastAuthAttemptAddress.current = address;
      void handleSignIn(address, 0);
    }
    if (!connected) {
      lastAuthAttemptAddress.current = null;
      setRetryCount(0);
    }
  }, [connected, address, isAuthenticating, status, handleSignIn]);

  // redirect to dashboard when authenticated + profile loaded
  useEffect(() => {
    if (status !== 'authenticated') {
      hasRedirectedToDashboard.current = false;
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated' && profile && !hasRedirectedToDashboard.current) {
      hasRedirectedToDashboard.current = true;
      router.replace('/dashboard');
    }
  }, [status, profile, router]);

  // loading screen
  if (!isMounted || status === 'loading' || (status === 'authenticated' && isProfileLoading)) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-aid-dark/5 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-aid-green text-white">
              <Radio size={40} />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-black text-aid-dark mb-2">Loading...</h1>
          <p className="text-gray-500 mb-8">
            {status === 'loading' ? 'Please wait while we prepare your session' : 'Please wait while we load your profile'}
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aid-green" />
          </div>
          <p className="mt-6 text-sm text-gray-400">This action is free and doesn&apos;t require gas fees</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-aid-dark/5 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-aid-green text-white">
            <Radio size={40} />
          </div>
        </div>

        <h1 className="text-3xl font-heading font-black text-aid-dark mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-8">
          Connect your wallet to manage your campaigns and aid efforts.
        </p>

        <div className="space-y-4">
          {connected && address ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Wallet connected: <span className="font-mono">{address.slice(0, 4)}...{address.slice(-4)}</span>
                </p>
              </div>
              <div className="w-full rounded-xl bg-aid-green/10 px-4 py-4 text-center text-sm font-semibold text-aid-green">
                {isAuthenticating
                  ? `Signing wallet${retryCount > 0 ? ` (retry ${retryCount}/${MAX_RETRIES})` : ''}...`
                  : status === 'authenticated'
                  ? 'Redirecting to dashboard...'
                  : 'Preparing your dashboard...'}
              </div>
              {!isAuthenticating && status === 'unauthenticated' && lastAuthAttemptAddress.current === address && (
                <p className="text-xs text-amber-600">
                  Authentication failed after {MAX_RETRIES} attempts. Try disconnecting and reconnecting your wallet.
                </p>
              )}
            </div>
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
