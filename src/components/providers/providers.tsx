'use client';

import React, { useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useWallet } from '@solana/wallet-adapter-react';
import '@solana/wallet-adapter-react-ui/styles.css';

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
const queryClient = new QueryClient();

function WalletAddressUpdater() {
  const { connected, publicKey } = useWallet();
  useEffect(() => {
    globalThis.__WALLET_ADDRESS__ = connected && publicKey ? publicKey.toBase58() : undefined;
  }, [connected, publicKey]);
  return null;
}

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Devnet;

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={SOLANA_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <WalletAddressUpdater />
            {children}
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
