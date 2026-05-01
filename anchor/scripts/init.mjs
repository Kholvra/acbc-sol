import * as anchor from "@coral-xyz/anchor";
import { readFileSync } from "fs";
import { PublicKey, Keypair } from "@solana/web3.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const idl = JSON.parse(
  readFileSync(join(__dirname, "../target/idl/aid_beacon.json"), "utf8")
);

const walletPath = process.env.HOME + "/.config/solana/mandora-devnet.json";
const walletKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(readFileSync(walletPath, "utf8")))
);

const connection = new anchor.web3.Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);
const wallet = new anchor.Wallet(walletKeypair);
const provider = new anchor.AnchorProvider(connection, wallet, {});
anchor.setProvider(provider);

const programId = new PublicKey("CiR2MzoqMxztJzvUsMbZJ3FtPZCZ3DX7WwTnh7FW7Cmn");
const idrxMint = new PublicKey("2PqiXtPxAm8LGPhjkNPJCyFxNBKhZ5kdEbdat6cxD8rj");

const program = new anchor.Program(idl, provider);

const [configPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("config")],
  programId
);

console.log("Program ID:", programId.toBase58());
console.log("IDRX Mint:", idrxMint.toBase58());
console.log("Config PDA:", configPda.toBase58());
console.log("Admin:", wallet.publicKey.toBase58());

try {
  const tx = await program.methods
    .initialize(idrxMint)
    .accounts({
      admin: wallet.publicKey,
      config: configPda,
      system_program: anchor.web3.SystemProgram.programId,
    })
    .rpc();
  console.log("✅ Initialized! Tx:", tx);
} catch (e) {
  if (e.message?.includes("already in use")) {
    console.log("✅ Config already initialized.");
  } else {
    console.error("Error:", e.message);
  }
}
