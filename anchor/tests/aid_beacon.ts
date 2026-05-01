import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AidBeacon } from "../target/types/aid_beacon";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";

describe("aid_beacon", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AidBeacon as Program<AidBeacon>;
  const wallet = provider.wallet as anchor.Wallet;

  let idrxMint: anchor.web3.PublicKey;
  let configPda: anchor.web3.PublicKey;
  let creatorTokenAccount: anchor.web3.PublicKey;

  before(async () => {
    idrxMint = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      null,
      9
    );

    [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
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

    creatorTokenAccount = await createAccount(
      provider.connection,
      wallet.payer,
      idrxMint,
      wallet.publicKey
    );

    await mintTo(
      provider.connection,
      wallet.payer,
      idrxMint,
      creatorTokenAccount,
      wallet.publicKey,
      1_000_000_000_000
    );
  });

  it("Initializes config", async () => {
    const config = await program.account.config.fetch(configPda);
    assert.equal(config.admin.toBase58(), wallet.publicKey.toBase58());
    assert.equal(config.idrxMint.toBase58(), idrxMint.toBase58());
  });

  it("Creates a campaign", async () => {
    const campaignId = new anchor.BN(1);
    const [campaignPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("campaign"),
        wallet.publicKey.toBuffer(),
        campaignId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("campaign_vault"), campaignPda.toBuffer()],
      program.programId
    );

    await program.methods
      .createCampaign(
        campaignId,
        "Flood Relief",
        "Helping victims of the Jakarta flood",
        "Disaster Relief",
        new anchor.BN(5000000)
      )
      .accounts({
        creator: wallet.publicKey,
        campaign: campaignPda,
        config: configPda,
        campaignVault: vaultPda,
        idrxMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const campaign = await program.account.campaign.fetch(campaignPda);
    assert.equal(campaign.title, "Flood Relief");
    assert.equal(campaign.isActive, true);
    assert.equal(campaign.raisedAmount.toNumber(), 0);
  });

  it("Donates to a campaign", async () => {
    const campaignId = new anchor.BN(1);
    const [campaignPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("campaign"),
        wallet.publicKey.toBuffer(),
        campaignId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("campaign_vault"), campaignPda.toBuffer()],
      program.programId
    );

    const donationId = new anchor.BN(Date.now());
    const [donationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("donation"),
        wallet.publicKey.toBuffer(),
        campaignPda.toBuffer(),
        donationId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    await program.methods
      .donate(donationId, new anchor.BN(10000))
      .accounts({
        donor: wallet.publicKey,
        campaign: campaignPda,
        donorTokenAccount: creatorTokenAccount,
        campaignVault: vaultPda,
        idrxMint,
        donation: donationPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const campaign = await program.account.campaign.fetch(campaignPda);
    assert.equal(campaign.raisedAmount.toNumber(), 10000);

    const vault = await getAccount(provider.connection, vaultPda);
    assert.equal(Number(vault.amount), 10000);
  });
});
