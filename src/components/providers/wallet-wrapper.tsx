'use client';

import React, { useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

type WalletWrapperProps = {
  className?: string;
  text?: string;
  withWalletAggregator?: boolean;
};

declare global {
  var __WALLET_ADDRESS__: string | undefined;
}

export default function WalletWrapper({ className, text }: WalletWrapperProps) {
  const { connected, publicKey, disconnect } = useWallet();
  const router = useRouter();

  useEffect(() => {
    globalThis.__WALLET_ADDRESS__ = connected && publicKey ? publicKey.toBase58() : undefined;
  }, [connected, publicKey]);

  const handleDisconnect = async () => {
    await disconnect();
    globalThis.__WALLET_ADDRESS__ = undefined;
    location.reload();
  };

  return (
    <div className={className ?? 'flex'}>
      {connected && publicKey ? (
        <div className="flex items-center gap-2">
          <div className="bg-aid-green text-white hover:bg-aid-dark transition-colors rounded-full px-4 py-2 font-bold font-body flex items-center gap-2">
            <span className="font-mono text-sm">
              {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
            </span>
          </div>
          <button
            onClick={() => {
              void handleDisconnect();
            }}
            className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
            aria-label="Disconnect wallet"
          >
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <WalletMultiButton className="bg-aid-green text-white hover:bg-aid-dark transition-colors rounded-full px-4 py-2 font-bold font-body !bg-aid-green !text-white !hover:bg-aid-dark !font-bold !font-body" />
      )}
    </div>
  );
}
