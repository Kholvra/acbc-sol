import { NextRequest, NextResponse } from "next/server";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { readFileSync } from "fs";

const FAUCET_AMOUNT = 1_000_000 * 1_000_000; // 1,000,000 IDRX (6 decimals)
const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour per wallet
const recentClaims = new Map<string, number>();

function loadMintAuthority(): Keypair | null {
  // 1. Try base64 env var (for serverless/Vercel)
  if (process.env.FAUCET_SECRET_KEY) {
    try {
      const secret = Buffer.from(process.env.FAUCET_SECRET_KEY, "base64");
      return Keypair.fromSecretKey(new Uint8Array(secret));
    } catch {
      console.warn("FAUCET_SECRET_KEY invalid, trying file fallback");
    }
  }

  // 2. Try file path env var or default
  const keypairPath =
    process.env.FAUCET_KEYPAIR_PATH ??
    `${process.env.HOME}/.config/solana/mandora-devnet.json`;

  try {
    return Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(readFileSync(keypairPath, "utf8")) as number[])
    );
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { walletAddress?: string };
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "walletAddress required" }, { status: 400 });
    }

    let recipient: PublicKey;
    try {
      recipient = new PublicKey(walletAddress);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    // Simple rate limit
    const lastClaim = recentClaims.get(walletAddress);
    if (lastClaim && Date.now() - lastClaim < RATE_LIMIT_MS) {
      const waitMin = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastClaim)) / 60000);
      return NextResponse.json(
        { error: `Please wait ${waitMin} more minute(s) before claiming again.` },
        { status: 429 }
      );
    }

    // Load mint authority keypair
    const mintAuthority = loadMintAuthority();
    if (!mintAuthority) {
      return NextResponse.json(
        { error: "Faucet not configured. Set FAUCET_SECRET_KEY or FAUCET_KEYPAIR_PATH." },
        { status: 503 }
      );
    }

    const mintAddress = new PublicKey(
      process.env.NEXT_PUBLIC_IDRX_MINT ?? "2PqiXtPxAm8LGPhjkNPJCyFxNBKhZ5kdEbdat6cxD8rj"
    );

    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
      "confirmed"
    );

    // Get or create recipient's associated token account
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority,
      mintAddress,
      recipient
    );

    // Mint IDRX to recipient
    const signature = await mintTo(
      connection,
      mintAuthority,
      mintAddress,
      ata.address,
      mintAuthority,
      FAUCET_AMOUNT
    );

    recentClaims.set(walletAddress, Date.now());

    return NextResponse.json({ success: true, signature, amount: 1_000_000 });
  } catch (error) {
    console.error("Faucet error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Faucet failed" },
      { status: 500 }
    );
  }
}
