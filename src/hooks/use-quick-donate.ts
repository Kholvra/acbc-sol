"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { toast } from "sonner";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { QUICK_DONATE_AMOUNT } from "~/constants/donation";
import {
  PROGRAM_ID,
  IDRX_MINT,
  AID_BEACON_IDL,
  type AidBeaconIdl,
  findCampaignPda,
  findCampaignVaultPda,
  findDonationPda,
  findConfigPda,
} from "~/constants/contracts";

interface UseQuickDonateProps {
  campaignAddress: string;
  onSuccess?: () => void;
}

export function useQuickDonate({
  campaignAddress,
  onSuccess,
}: UseQuickDonateProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [step, setStep] = useState<"idle" | "donating">("idle");
  const [isSuccess, setIsSuccess] = useState(false);

  const executeQuickDonate = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!campaignAddress || campaignAddress.length < 32) {
      toast.error("Campaign has not been deployed on-chain yet");
      return;
    }

    setStep("donating");
    setIsSuccess(false);

    try {
      const campaignPubkey = new PublicKey(campaignAddress);
      const amount = new BN(Number(QUICK_DONATE_AMOUNT) * 1e9); // Assuming 9 decimals
      const donationId = new BN(Date.now());

      const [configPda] = findConfigPda();
      const [vaultPda] = findCampaignVaultPda(campaignPubkey);
      const [donationPda] = findDonationPda(
        publicKey,
        campaignPubkey,
        BigInt(donationId.toString()),
      );

      // Get or create donor token account
      const donorTokenAccount = await getAssociatedTokenAddress(
        IDRX_MINT,
        publicKey,
      );

      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction } as never,
        { commitment: "confirmed" },
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const program = new Program(AID_BEACON_IDL, provider) as any;

      const tx = new Transaction();

      // Check if donor token account exists; if not, add creation instruction
      const donorAccountInfo =
        await connection.getAccountInfo(donorTokenAccount);
      if (!donorAccountInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            donorTokenAccount,
            publicKey,
            IDRX_MINT,
          ),
        );
      }

      tx.add(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await program.methods
          .donate(donationId, amount)
          .accounts({
            donor: publicKey,
            campaign: campaignPubkey,
            donor_token_account: donorTokenAccount,
            campaign_vault: vaultPda,
            idrx_mint: IDRX_MINT,
            donation: donationPda,
            token_program: TOKEN_PROGRAM_ID,
            system_program: PublicKey.default,
          })
          .instruction(),
      );

      tx.feePayer = publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");

      toast.success(`Berhasil Donasi ${QUICK_DONATE_AMOUNT} IDRX!`);
      setIsSuccess(true);
      onSuccess?.();
    } catch (error) {
      console.error("Quick Donate Error:", error);
      toast.error("Gagal donasi. Coba lagi ya.");
    } finally {
      setStep("idle");
    }
  }, [publicKey, signTransaction, connection, campaignAddress, onSuccess]);

  return {
    executeQuickDonate,
    isProcessing: step !== "idle",
    isApproving: false,
    isDonating: step === "donating",
    isSuccess,
  };
}
