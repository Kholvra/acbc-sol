---
description: Full user workflow for AidBeacon — Donor and Campaigner side
---

# AidBeacon User Workflow
x  
## Prerequisites (One-time Setup)

1. Install **Phantom** or **Solflare** wallet browser extension
2. Switch network to **Devnet**:
   - Phantom: Settings → Developer Settings → Testnet Mode ON (or manually set RPC to `https://api.devnet.solana.com`)
   - Solflare: Settings → Network → Devnet
3. Make sure the dev server is running:
   ```
   npm run dev
   ```
4. **Start PostgreSQL** (only if first time or after reboot):
   ```
   pg_ctl -D ~/.local/pgsql/data start
   ```
   If it's the first time ever:
   ```
   mkdir -p ~/.local/pgsql/data
   initdb -D ~/.local/pgsql/data --auth=trust --no-locale --encoding=UTF8
   echo "unix_socket_directories = '/tmp'" >> ~/.local/pgsql/data/postgresql.conf
   pg_ctl -D ~/.local/pgsql/data start
   createdb rework-aid-beacon
   npx prisma db push
   ```
5. Apply DB schema if first time:
   ```
   npx prisma db push
   ```

---

## DONOR WORKFLOW

### 1. Connect & Sign In

- Go to `http://localhost:3000`
- Click **Connect Wallet** → select Phantom/Solflare
- App auto-prompts: **"Sign Message to Login"** → approve in wallet (no gas, just a signature)
- First login: **Role Selection Modal** appears → choose **"I am a Donor (Donatur)"**
- You land on `/dashboard`

### 2. Get Test IDRX (Faucet)

- Go to **Profile** (bottom nav icon)
- Click **"Get 1,000,000 IDRX"** button
- Server mints 1,000,000 IDRX directly to your wallet
- Balance updates automatically every 10 seconds

> ⚠️ Rate limit: 1 claim per wallet per hour

### 3. Browse & Watch Campaigns

- Go to **Live** tab → see active live campaigns with real-time streams
- Go to **Explore** tab → see all campaigns (live + non-live)
- Click any campaign card to open the viewer stream

### 4. Donate

- Inside a campaign stream, click the **donate / quick donate button**
- Transaction pops up in your wallet → **Approve**
- IDRX transfers on-chain to the campaign vault
- Donation amount appears in campaign's raised total

---

## CAMPAIGNER WORKFLOW

### 1. Connect & Sign In

- Same sign-in flow as Donor
- Role Selection Modal → choose **"I am a Campaigner"**
- App redirects to `/kyc` for identity verification

### 2. KYC Verification

- Go to `/kyc`
- Upload your **KTP** (Indonesian ID card photo)
- AI extracts NIK and name automatically
- After verification, you can create campaigns

### 3. Create a Campaign

- Click the **+ Create Campaign** button (bottom nav / dashboard)
- Fill in:
  - **Title** — campaign name
  - **Category** — medical, construction, etc.
  - **Province** — location
  - **Target Amount** — in IDRX
  - **End Date**
  - **Description**
  - **Budget Items** — itemised spending plan
- Click **Create** → two transactions fire:
  1. DB record created via tRPC
  2. On-chain `create_campaign` transaction → approve in wallet

### 4. Go Live (Livestream)

- From **Live** tab → click the **broadcast icon** (top right)
- **Create Live Session** modal → link to your campaign
- Click **Start Streaming** → browser requests camera/mic access
- You are now live! Viewers can see your stream and donate

### 5. Withdraw Donations

- When campaign ends or target is reached, go to your campaign
- Click **Withdraw** → on-chain `withdraw` transaction
- Approve in wallet → IDRX moves from campaign vault to your token account

---

## Key Addresses (Solana Devnet)

| Item       | Address                                        |
| ---------- | ---------------------------------------------- |
| Program ID | `CiR2MzoqMxztJzvUsMbZJ3FtPZCZ3DX7WwTnh7FW7Cmn` |
| IDRX Mint  | `2PqiXtPxAm8LGPhjkNPJCyFxNBKhZ5kdEbdat6cxD8rj` |
| Explorer   | https://solscan.io/?cluster=devnet             |

---

## Restarting the Dev Server

After any `.env` change, restart the dev server:

```
# In the terminal running npm run dev, press Ctrl+C then:
npm run dev
```
