import { sign } from "tweetnacl";
import { PublicKey } from "@solana/web3.js";

export function verifySignature(
  message: string,
  signature: Uint8Array,
  publicKeyBase58: string,
): boolean {
  const messageBytes = new TextEncoder().encode(message);
  const publicKey = new PublicKey(publicKeyBase58).toBytes();
  return sign.detached.verify(messageBytes, signature, publicKey);
}
