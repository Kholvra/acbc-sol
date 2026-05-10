import { randomBytes } from "crypto";

const NONCE_TTL = 5 * 60 * 1000;
const CLEANUP_INTERVAL = 60 * 1000;

const store = new Map<string, number>();

const interval = setInterval(() => {
  const now = Date.now();
  for (const [nonce, ts] of store) {
    if (now - ts > NONCE_TTL) {
      store.delete(nonce);
    }
  }
}, CLEANUP_INTERVAL);

if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
  interval.unref();
}

export function generateNonce(): string {
  const nonce = randomBytes(32).toString("hex");
  store.set(nonce, Date.now());
  return nonce;
}

export function createAuthMessage(nonce: string): string {
  return `Sign in to AidBeacon\nNonce: ${nonce}`;
}

export function consumeNonce(nonce: string): boolean {
  const ts = store.get(nonce);
  if (!ts) return false;
  store.delete(nonce);
  if (Date.now() - ts > NONCE_TTL) return false;
  return true;
}
