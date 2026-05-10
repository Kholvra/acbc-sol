'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletSignMessageError } from '@solana/wallet-adapter-base';

type AuthState =
  | { status: 'idle' }
  | { status: 'fetching-challenge' }
  | { status: 'awaiting-signature' }
  | { status: 'verifying' }
  | { status: 'error'; message: string }
  | { status: 'expired-nonce' };

export default function SignInPage() {
  const { connected, publicKey, signMessage } = useWallet();
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({ status: 'idle' });

  const handleSignIn = useCallback(async () => {
    if (!signMessage || !publicKey) return;

    setAuthState({ status: 'fetching-challenge' });

    try {
      const challengeRes = await fetch('/api/auth/challenge');
      const { nonce, message } = (await challengeRes.json()) as {
        nonce: string;
        message: string;
      };

      setAuthState({ status: 'awaiting-signature' });

      const signature = await signMessage(new TextEncoder().encode(message));

      setAuthState({ status: 'verifying' });

      const verifyRes = await fetch('/api/auth/solana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          signature: Array.from(signature),
          publicKey: publicKey.toBase58(),
          nonce,
        }),
      });

      if (!verifyRes.ok) {
        const errBody = (await verifyRes.json()) as { error?: string };
        if (errBody.error?.toLowerCase().includes('nonce')) {
          setAuthState({ status: 'expired-nonce' });
          return;
        }
        setAuthState({
          status: 'error',
          message: errBody.error ?? 'Verification failed',
        });
        return;
      }

      router.replace('/dashboard');
    } catch (err) {
      if (err instanceof WalletSignMessageError) {
        setAuthState({
          status: 'error',
          message: 'Signature rejected. Please sign the message to continue.',
        });
        return;
      }
      setAuthState({
        status: 'error',
        message:
          err instanceof Error ? err.message : 'Something went wrong',
      });
    }
  }, [signMessage, publicKey, router]);

  const retry = useCallback(() => {
    setAuthState({ status: 'idle' });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="text-gray-600 text-sm">
          Connect your Solana wallet to sign in.
        </p>

        <div className="flex justify-center">
          <WalletMultiButton className="bg-aid-green text-white hover:bg-aid-dark transition-colors rounded-full px-4 py-2 font-bold font-body !bg-aid-green !text-white !hover:bg-aid-dark !font-bold !font-body" />
        </div>

        {connected && publicKey && (
          <button
            onClick={handleSignIn}
            disabled={
              authState.status === 'fetching-challenge' ||
              authState.status === 'awaiting-signature' ||
              authState.status === 'verifying'
            }
            className="w-full rounded-full bg-aid-green px-4 py-2 font-bold text-white hover:bg-aid-dark transition-colors disabled:opacity-50"
          >
            {authState.status === 'fetching-challenge'
              ? 'Getting challenge...'
              : authState.status === 'awaiting-signature'
                ? 'Check your wallet...'
                : authState.status === 'verifying'
                  ? 'Verifying...'
                  : 'Sign In with Solana'}
          </button>
        )}

        {(authState.status === 'error' ||
          authState.status === 'expired-nonce') && (
          <div className="space-y-2">
            <p className="text-sm text-red-600">
              {authState.status === 'expired-nonce'
                ? 'Session expired. Please try again.'
                : authState.message}
            </p>
            <button
              onClick={retry}
              className="text-sm text-aid-green underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
