import { PublicKey } from "@solana/web3.js";
import type { Idl } from "@coral-xyz/anchor";

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ?? "CiR2MzoqMxztJzvUsMbZJ3FtPZCZ3DX7WwTnh7FW7Cmn"
);
export const IDRX_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_IDRX_MINT ?? "2PqiXtPxAm8LGPhjkNPJCyFxNBKhZ5kdEbdat6cxD8rj"
);
export const QUICK_DONATE_AMOUNT = '1000';

export function findConfigPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    PROGRAM_ID
  );
}

export function findCampaignPda(creator: PublicKey, campaignId: bigint): [PublicKey, number] {
  const idBuffer = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) {
    idBuffer[i] = Number((campaignId >> BigInt(i * 8)) & BigInt(0xff));
  }
  return PublicKey.findProgramAddressSync(
    [Buffer.from("campaign"), creator.toBuffer(), idBuffer],
    PROGRAM_ID
  );
}

export function findCampaignVaultPda(campaign: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("campaign_vault"), campaign.toBuffer()],
    PROGRAM_ID
  );
}

export function findDonationPda(
  donor: PublicKey,
  campaign: PublicKey,
  donationId: bigint
): [PublicKey, number] {
  const idBuffer = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) {
    idBuffer[i] = Number((donationId >> BigInt(i * 8)) & BigInt(0xff));
  }
  return PublicKey.findProgramAddressSync(
    [Buffer.from("donation"), donor.toBuffer(), campaign.toBuffer(), idBuffer],
    PROGRAM_ID
  );
}

// Anchor IDL for the AidBeacon program
export const AID_BEACON_IDL = {
  "address": PROGRAM_ID.toBase58(),
  "metadata": {
    "name": "aid_beacon",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "AidBeacon disaster relief crowdfunding program"
  },
  "instructions": [
    {
      "name": "initialize",
      "discriminator": [175, 175, 109, 31, 13, 152, 155, 237],
      "accounts": [
        { "name": "admin", "writable": true, "signer": true },
        { "name": "config", "writable": true, "pda": { "seeds": [{ "kind": "const", "value": [99, 111, 110, 102, 105, 103] }] } },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": [
        { "name": "idrx_mint", "type": "pubkey" }
      ]
    },
    {
      "name": "create_campaign",
      "discriminator": [111, 131, 236, 170, 100, 194, 127, 105],
      "accounts": [
        { "name": "creator", "writable": true, "signer": true },
        { "name": "campaign", "writable": true, "pda": { "seeds": [
          { "kind": "const", "value": [99, 97, 109, 112, 97, 105, 103, 110] },
          { "kind": "account", "path": "creator" },
          { "kind": "arg", "path": "campaign_id" }
        ] } },
        { "name": "config" },
        { "name": "campaign_vault", "writable": true, "pda": { "seeds": [
          { "kind": "const", "value": [99, 97, 109, 112, 97, 105, 103, 110, 95, 118, 97, 117, 108, 116] },
          { "kind": "account", "path": "campaign" }
        ] } },
        { "name": "idrx_mint" },
        { "name": "token_program", "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { "name": "system_program", "address": "11111111111111111111111111111111" },
        { "name": "rent", "address": "SysvarRent111111111111111111111111111111111" }
      ],
      "args": [
        { "name": "campaign_id", "type": "u64" },
        { "name": "title", "type": "string" },
        { "name": "description", "type": "string" },
        { "name": "category", "type": "string" },
        { "name": "target_amount", "type": "u64" }
      ]
    },
    {
      "name": "donate",
      "discriminator": [121, 186, 218, 211, 73, 70, 196, 127],
      "accounts": [
        { "name": "donor", "writable": true, "signer": true },
        { "name": "campaign", "writable": true },
        { "name": "donor_token_account", "writable": true },
        { "name": "campaign_vault", "writable": true },
        { "name": "idrx_mint" },
        { "name": "donation", "writable": true, "pda": { "seeds": [
          { "kind": "const", "value": [100, 111, 110, 97, 116, 105, 111, 110] },
          { "kind": "account", "path": "donor" },
          { "kind": "account", "path": "campaign" },
          { "kind": "arg", "path": "donation_id" }
        ] } },
        { "name": "token_program", "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": [
        { "name": "donation_id", "type": "u64" },
        { "name": "amount", "type": "u64" }
      ]
    },
    {
      "name": "cancel_campaign",
      "discriminator": [111, 69, 161, 31, 187, 143, 36, 91],
      "accounts": [
        { "name": "creator", "signer": true },
        { "name": "campaign", "writable": true }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "discriminator": [183, 18, 70, 156, 148, 167, 216, 23],
      "accounts": [
        { "name": "creator", "writable": true, "signer": true },
        { "name": "campaign", "writable": true },
        { "name": "campaign_vault", "writable": true },
        { "name": "creator_token_account", "writable": true },
        { "name": "idrx_mint" },
        { "name": "token_program", "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Config",
      "discriminator": [155, 12, 170, 224, 30, 250, 204, 130],
      "fields": [
        { "name": "admin", "type": "pubkey" },
        { "name": "idrx_mint", "type": "pubkey" },
        { "name": "bump", "type": "u8" }
      ]
    },
    {
      "name": "Campaign",
      "discriminator": [50, 80, 171, 66, 171, 3, 28, 168],
      "fields": [
        { "name": "creator", "type": "pubkey" },
        { "name": "title", "type": "string" },
        { "name": "description", "type": "string" },
        { "name": "category", "type": "string" },
        { "name": "target_amount", "type": "u64" },
        { "name": "raised_amount", "type": "u64" },
        { "name": "is_active", "type": "bool" },
        { "name": "created_at", "type": "i64" },
        { "name": "bump", "type": "u8" }
      ]
    },
    {
      "name": "Donation",
      "discriminator": [165, 129, 69, 67, 75, 137, 175, 225],
      "fields": [
        { "name": "donor", "type": "pubkey" },
        { "name": "campaign", "type": "pubkey" },
        { "name": "amount", "type": "u64" },
        { "name": "timestamp", "type": "i64" },
        { "name": "bump", "type": "u8" }
      ]
    }
  ],
  "errors": [
    { "code": 6000, "name": "TitleTooLong", "msg": "Title exceeds maximum length" },
    { "code": 6001, "name": "DescriptionTooLong", "msg": "Description exceeds maximum length" },
    { "code": 6002, "name": "CategoryTooLong", "msg": "Category exceeds maximum length" },
    { "code": 6003, "name": "InvalidTargetAmount", "msg": "Target amount must be greater than zero" },
    { "code": 6004, "name": "Unauthorized", "msg": "Unauthorized access" },
    { "code": 6005, "name": "CampaignInactive", "msg": "Campaign is inactive" },
    { "code": 6006, "name": "InvalidDonationAmount", "msg": "Donation amount must be greater than zero" },
    { "code": 6007, "name": "CampaignHasDonations", "msg": "Campaign has existing donations and cannot be cancelled" },
    { "code": 6008, "name": "NoFundsToWithdraw", "msg": "No funds available to withdraw" }
  ]
} as unknown as Idl;

export type AidBeaconIdl = Idl;
