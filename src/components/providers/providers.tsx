'use client';

import React from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, createStorage, cookieStorage, http, type State } from 'wagmi';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { SessionProvider } from 'next-auth/react';

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'), 
  },
  connectors: [
    coinbaseWallet({
      appName: 'AidBeacon',
      preference: 'all', 
    }),
    injected(),
  ],
});

export function Providers({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: State;
}) {
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY === 'your-onchainkit-key' ? '' : (process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ?? '');

  return (
    <SessionProvider>
      <WagmiProvider config={wagmiConfig} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          <OnchainKitProvider
            apiKey={apiKey}
            chain={baseSepolia}
            config={{
              appearance: {
                mode: 'light',
                theme: 'custom',
              },
              wallet: {
                  display: 'modal', 
              }
            }}
          >
            {children}
          </OnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
