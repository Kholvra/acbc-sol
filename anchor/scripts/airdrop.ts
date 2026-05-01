import * as anchor from "@coral-xyz/anchor";
import {
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import fs from "fs";
import path from "path";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;

  const deployPath = path.join(__dirname, "../deploy.json");
  if (!fs.existsSync(deployPath)) {
    console.error("deploy.json not found. Run deploy.ts first.");
    process.exit(1);
  }

  const deployInfo = JSON.parse(fs.readFileSync(deployPath, "utf-8"));
  const idrxMint = new anchor.web3.PublicKey(deployInfo.idrxMint);

  const recipientArg = process.argv[2];
  const amountArg = process.argv[3] ?? "1000000";

  const recipient = recipientArg
    ? new anchor.web3.PublicKey(recipientArg)
    : wallet.publicKey;

  const amount = Number(amountArg) * 1e9; // 9 decimals

  const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    wallet.payer,
    idrxMint,
    recipient
  );

  await mintTo(
    provider.connection,
    wallet.payer,
    idrxMint,
    recipientTokenAccount.address,
    wallet.publicKey,
    amount
  );

  console.log(`Airdropped ${amountArg} IDRX to ${recipient.toBase58()}`);
  console.log("Token Account:", recipientTokenAccount.address.toBase58());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
