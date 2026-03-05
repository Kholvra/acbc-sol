import type { Address } from 'viem';


// type assertion helper for viem Address type
export function assertAddress(value: string | undefined | null): Address | undefined {
  if (!value) return undefined;
  return value as Address;
}

// check if a string is a valid Ethereum address format
export function isValidAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}
