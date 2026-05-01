import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { AidBeacon } from "../target/types/aid_beacon";
import {
  TOKEN_PROGRAM_ID,
  createMint,
} from "@solana/spl-token";
import fs from "fs";
import path from "path";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.AidBeacon as Program<AidBeacon>;

  console.log("Program ID:", program.programId.toBase58());
  console.log("Deployer:", wallet.publicKey.toBase58());

  // Create IDRX mint
  const idrxMint = await createMint(
    provider.connection,
    wallet.payer,
    wallet.publicKey,
    null,
    9
  );
  console.log("IDRX Mint:", idrxMint.toBase58());

  // Initialize config
  const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );

  await program.methods
    .initialize(idrxMint)
    .accounts({
      admin: wallet.publicKey,
      config: configPda,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Config PDA:", configPda.toBase58());

  // Save deployment info
  const deployInfo = {
    network: provider.connection.rpcEndpoint,
    programId: program.programId.toBase58(),
    idrxMint: idrxMint.toBase58(),
    configPda: configPda.toBase58(),
    deployer: wallet.publicKey.toBase58(),
  };

  const deployPath = path.join(__dirname, "../deploy.json");
  fs.writeFileSync(deployPath, JSON.stringify(deployInfo, null, 2));
  console.log("Deployment info saved to", deployPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
