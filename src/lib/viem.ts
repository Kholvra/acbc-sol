import { PublicKey } from '@solana/web3.js';

// type assertion helper for Solana PublicKey
export function assertPublicKey(value: string | undefined | null): PublicKey | undefined {
  if (!value) return undefined;
  try {
    return new PublicKey(value);
  } catch {
    return undefined;
  }
}

// check if a string is a valid Solana address format
export function isValidAddress(value: string): boolean {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}
