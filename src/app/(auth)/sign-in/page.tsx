'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { signIn, signOut, useSession } from 'next-auth/react';
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
  const { connected, publicKey, signMessage } = useWallet();
  const { status } = useSession();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const hasRedirectedToDashboard = useRef(false);

  // tRPC utils for invalidation
  const utils = api.useUtils();

  // check if user exists in DB
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: hasProfileError,
  } = api.user.getProfile.useQuery(undefined, {
    enabled: status === 'authenticated' && connected,
    retry: false,
    staleTime: 0, // always refetch when enabled
  });

  // track which address we've already attempted auth for
  const lastAuthAttemptAddress = useRef<string | null>(null);
  const address = publicKey?.toBase58() ?? null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // browser-native Uint8Array -> base64 (no Buffer dependency)
  const toBase64 = (bytes: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]!);
    }
    return btoa(binary);
  };

  // wrap a promise with a timeout — used to detect hung signMessage (Phantom EVM conflict)
  const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout: ${label} took longer than ${ms / 1000}s`)), ms)
      ),
    ]);
  };

  const handleSignIn = useCallback(async (walletAddress: string) => {
    // skip if no address or already authenticated with profile
    if (!walletAddress || (status === 'authenticated' && profile)) {
      return;
    }

    if (!signMessage) {
      toast.error('Wallet does not support message signing');
      return;
    }

    setIsAuthenticating(true);

    try {
      const timestamp = Date.now();
      const message = buildAuthMessage(walletAddress, timestamp);
      const messageBytes = new TextEncoder().encode(message);

      // 60s timeout — Phantom can hang indefinitely when EVM injection conflicts
      const signatureBytes = await withTimeout(signMessage(messageBytes), 60000, 'signMessage');

      if (!signatureBytes || signatureBytes.length === 0) {
        throw new Error('Wallet returned an empty signature');
      }

      const signature = toBase64(signatureBytes);

      console.log('[sign-in] signature obtained, calling NextAuth signIn...');

      const result = await withTimeout(
        signIn('credentials', {
          message,
          signature,
          address: walletAddress,
          redirect: false,
        }),
        30000,
        'NextAuth signIn'
      );

      if (result?.error) {
        throw new Error(result.error);
      }

      console.log('[sign-in] auth successful, invalidating profile...');
      toast.success('Successfully authenticated!');

      // invalidate profile query to ensure fresh data
      await utils.user.getProfile.invalidate();

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Authentication failed';
      console.error('[sign-in] error:', msg);

      if (msg.includes('User rejected') || msg.includes('cancelled')) {
        toast.error('Signature cancelled');
      } else if (msg.includes('Timeout')) {
        toast.error('Wallet request timed out. Try refreshing the page and disabling other wallet extensions.');
      } else if (msg.includes('CredentialsSignin')) {
        toast.error('Authentication failed. Please try again.');
      } else {
        toast.error(msg);
      }
      // don't reset ref - let user manually retry via button
    } finally {
      setIsAuthenticating(false);
    }
  }, [signMessage, status, profile, utils]);

  useEffect(() => {
    if (connected && address && !isAuthenticating && status === 'unauthenticated' && lastAuthAttemptAddress.current !== address) {
      lastAuthAttemptAddress.current = address;
      void handleSignIn(address);
    }

    if (!connected) {
      lastAuthAttemptAddress.current = null;
    }
  }, [connected, address, isAuthenticating, status, handleSignIn]);

  // redirect to dashboard if authenticated and profile exists
  useEffect(() => {
    if (status !== 'authenticated') {
      hasRedirectedToDashboard.current = false;
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated' && profile) {
      if (hasRedirectedToDashboard.current) return;
      hasRedirectedToDashboard.current = true;

      router.replace('/dashboard');
    }
  }, [status, profile, router]);

  useEffect(() => {
    if (status !== 'authenticated' || isProfileLoading) return;
    if (profile !== null && !hasProfileError) return;

    void signOut({ redirect: false }).then(() => {
      router.refresh();
    });
  }, [status, profile, hasProfileError, isProfileLoading, router]);

  // Render a stable fallback until the client has mounted to avoid wallet/session hydration mismatches.
  if (!isMounted || status === 'loading' || (status === 'authenticated' && isProfileLoading)) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-aid-dark/5 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-aid-green text-white">
              <Radio size={40} />
            </div>
          </div>

          <h1 className="text-3xl font-heading font-black text-aid-dark mb-2">
            {!isMounted || status === 'loading' ? 'Loading...' : 'Loading...'}
          </h1>
          <p className="text-gray-500 mb-8">
            {!isMounted || status === 'loading'
              ? 'Please wait while we prepare your session'
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
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white px-4">
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
          {connected && address ? (
            <>
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Wallet connected: <span className="font-mono">{address.slice(0, 4)}...{address.slice(-4)}</span>
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
