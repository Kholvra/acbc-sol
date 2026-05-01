'use client';

import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface CampaignOnChainState {
  title: string;
  description: string;
  category: string;
  targetAmount: bigint;
  raisedAmount: bigint;
  isActive: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useCampaignState(onChainAddress: string | null | undefined): CampaignOnChainState {
  const { connection } = useConnection();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const [state, setState] = useState<CampaignOnChainState>({
    title: '',
    description: '',
    category: '',
    targetAmount: BigInt(0),
    raisedAmount: BigInt(0),
    isActive: false,
    isLoading: true,
    error: null,
    refresh,
  });

  useEffect(() => {
    if (!onChainAddress) {
      setState((s) => ({ ...s, isLoading: false, refresh }));
      return;
    }

    let cancelled = false;

    async function fetchState() {
      try {
        const pubkey = new PublicKey(onChainAddress as string);
        const account = await connection.getAccountInfo(pubkey);
        if (!account) {
          if (!cancelled) setState((s) => ({ ...s, isLoading: false, error: new Error('Campaign account not found') }));
          return;
        }

        // Anchor account discriminator for Campaign (8 bytes)
        // Campaign struct layout:
        // 8 bytes discriminator
        // 32 bytes owner (Pubkey)
        // 8 bytes campaign_id (u64)
        // 4 + bytes title (String)
        // 4 + bytes description (String)
        // 4 + bytes category (String)
        // 8 bytes target_amount (u64)
        // 8 bytes raised_amount (u64)
        // 1 byte is_active (bool)
        // 1 byte bump (u8)
        // Total: variable length
        const data = account.data;
        let offset = 8; // skip discriminator

        offset += 32; // skip owner pubkey
        offset += 8; // skip campaign_id

        // read title
        const titleLen = data.readUInt32LE(offset);
        offset += 4;
        const title = data.slice(offset, offset + titleLen).toString('utf-8');
        offset += titleLen;

        // read description
        const descLen = data.readUInt32LE(offset);
        offset += 4;
        const description = data.slice(offset, offset + descLen).toString('utf-8');
        offset += descLen;

        // read category
        const catLen = data.readUInt32LE(offset);
        offset += 4;
        const category = data.slice(offset, offset + catLen).toString('utf-8');
        offset += catLen;

        // read target_amount
        const targetAmount = data.readBigUInt64LE(offset);
        offset += 8;

        // read raised_amount
        const raisedAmount = data.readBigUInt64LE(offset);
        offset += 8;

        // read is_active
        const isActive = data[offset] === 1;

        if (!cancelled) {
          setState({
            title,
            description,
            category,
            targetAmount,
            raisedAmount,
            isActive,
            isLoading: false,
            error: null,
            refresh,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState((s) => ({ ...s, isLoading: false, error: err instanceof Error ? err : new Error('Unknown error'), refresh }));
        }
      }
    }

    void fetchState();

    const interval = setInterval(fetchState, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [connection, onChainAddress, refreshKey]);

  return state;
}
