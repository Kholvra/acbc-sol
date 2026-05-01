# AidBeacon 🚨

A decentralized disaster relief and crowdfunding platform built on Solana. AidBeacon enables transparent, real-time fundraising for disaster relief efforts through blockchain-verified campaigns, live streaming, and crypto donations.

## ✨ Features

- **🔐 Wallet-Based Authentication** — Sign in with Solana wallet (Phantom, Solflare) using signature verification
- **📱 TikTok-Style Campaign Feed** — Swipeable, full-screen vertical feed for discovering and donating to disaster relief campaigns
- **⚡ Quick Donate** — Swipe-to-donate 1000 IDRX (SPL token) via Anchor program
- **🎥 Live Streaming** — Go live from disaster sites with real-time donation notifications and viewer interaction
- **🗺️ Interactive Map** — Choropleth map of Indonesia showing campaign distribution by province
- **🪪 KYC Verification** — AI-powered Indonesian KTP (identity card) verification using Groq/Llama 4 OCR
- **📋 Purchase Agreements** — Admin workflow for approving campaign expenses with invoice verification
- **👤 Profile & Transaction History** — Wallet balance, donation history, and campaign management

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** — App Router with React 19
- **[TypeScript](https://www.typescriptlang.org/)** — Strict mode for type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** — Animations
- **[Lucide React](https://lucide.dev/)** — Icon library
- **[Sonner](https://sonner.emilkowal.ski/)** — Toast notifications

### Blockchain / Web3
- **[Anchor](https://www.anchor-lang.com/)** — Solana program framework
- **[@solana/web3.js](https://solana-labs.github.io/solana-web3.js/)** — Solana client library
- **[@solana/wallet-adapter](https://github.com/anza-xyz/wallet-adapter)** — Wallet integration (Phantom, Solflare)
- **[Solana Devnet](https://api.devnet.solana.com)** — Testnet for development
- **SPL Token (IDRX)** — Token used for donations

### Backend
- **[tRPC v11](https://trpc.io/)** — End-to-end type-safe API
- **[NextAuth.js v5](https://next-auth.js.org/)** — Wallet signature authentication
- **[Prisma ORM v6](https://prisma.io/)** — Type-safe database queries
- **[PostgreSQL](https://www.postgresql.org/)** — Relational database (Supabase)

### AI / Storage / Video
- **[Groq](https://groq.com/)** — LLM inference for KTP OCR extraction
- **[Pinata](https://www.pinata.cloud/)** — IPFS storage for campaign metadata and media
- **[VideoSDK.live](https://www.videosdk.live/)** — Live streaming infrastructure

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (via Supabase or local Docker)
- Phantom or Solflare wallet browser extension

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/rework-aid-beacon.git
   cd rework-aid-beacon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in required values (see Environment Variables section).

4. **Start PostgreSQL database** (optional, for local dev)
   ```bash
   ./start-database.sh
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
rework-aid-beacon/
├── anchor/
│   ├── programs/              # Anchor Solana program (Rust)
│   ├── tests/                 # Program tests
│   └── target/                # Build output, IDL, keypairs
├── prisma/
│   ├── schema.prisma          # Database models (User, Campaign, KYC, etc.)
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── (auth)/            # Authentication routes (sign-in, sign-up)
│   │   ├── (dashboard)/       # Protected routes (dashboard, campaigns, live, etc.)
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth endpoint
│   │   │   ├── trpc/          # tRPC API endpoint
│   │   │   └── faucet/        # IDRX token faucet
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── campaign/          # Campaign cards, creation, swipe gestures
│   │   ├── live/              # Live streaming components
│   │   ├── kyc/               # KYC verification UI
│   │   ├── explore/           # Interactive map
│   │   ├── onboarding/        # Role selection flow
│   │   ├── sections/          # Landing page sections
│   │   └── ui/                # Reusable UI primitives
│   ├── server/
│   │   ├── api/               # tRPC routers and schemas
│   │   ├── auth/              # NextAuth configuration (Solana sig verify)
│   │   └── db.ts              # Prisma client singleton
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities (AI, video, storage)
│   ├── constants/             # Contract addresses, PDA helpers
│   └── env.js                 # Environment variable validation
└── public/                    # Static assets
```

## 🗄️ Database Schema

- **User** — Wallet-based user accounts with roles (DONATUR, CAMPAIGNER, ADMIN)
- **KycDocument** — Identity verification records (KTP)
- **Campaign** — Off-chain campaign metadata linked to on-chain PDA accounts
- **CampaignItem** — Budget line items for campaigns
- **PurchaseAgreement** — Expense tracking with admin approval workflow
- **AgreementItem** — Line items within purchase agreements
- **Invoice** — Invoices linked to approved agreements
- **InvoiceAttachment** — File attachments for invoices

## 🔗 Solana Program

The Anchor program is deployed on Solana Devnet:

| Account/Instruction | Description |
|---|---|
| **Config** | Global config PDA storing admin and IDRX mint address |
| **Campaign** | Per-campaign PDA with creator, title, amounts, active flag |
| **Donation** | Per-donation PDA tracking donor, campaign, amount, timestamp |
| `initialize` | Initialize global config (admin only) |
| `create_campaign` | Create a new fundraising campaign |
| `donate` | Transfer IDRX tokens from donor to campaign vault |
| `cancel_campaign` | Cancel an active campaign (creator only) |
| `withdraw` | Withdraw raised funds to creator (PDA → creator ATA) |

## 🔐 Authentication

1. User connects Solana wallet (Phantom or Solflare)
2. Frontend builds a message with wallet address + timestamp
3. User signs the message (free, no gas required)
4. Backend verifies signature using `tweetnacl`
5. User is looked up or created in database by address
6. JWT session created with 24-hour max age

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server (turbo mode)
npm run build        # Build for production
npm run start        # Start production server
npm run check        # Run lint + typecheck
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format:write # Format code with Prettier
npm run typecheck    # TypeScript type check
npm run db:generate  # Generate Prisma migrations
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio GUI
npm run anchor:deploy # Deploy Solana program to devnet
npm run anchor:airdrop # Request SOL airdrop on devnet
```

### Database Management

```bash
./start-database.sh  # Start PostgreSQL with Docker
npx prisma studio    # Open Prisma Studio (database GUI)
```

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set all required environment variables (see below)
3. Deploy — Vercel auto-detects Next.js

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `AUTH_SECRET` | JWT encryption secret (`npx auth secret`) | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DIRECT_URL` | Direct PostgreSQL URL (no pooler) for migrations | Yes |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana RPC endpoint | Yes |
| `NEXT_PUBLIC_PROGRAM_ID` | Deployed Anchor program ID | Yes |
| `NEXT_PUBLIC_IDRX_MINT` | IDRX SPL token mint address | Yes |
| `NEXT_PUBLIC_PINATA_JWT` | Pinata API JWT for IPFS uploads | Yes |
| `NEXT_PUBLIC_GATEWAY_URL` | IPFS gateway URL | No |
| `NEXT_PUBLIC_VIDEOSDK_API_KEY` | VideoSDK API key for live streaming | Yes |
| `VIDEOSDK_SECRET_KEY` | VideoSDK secret key (server-side) | Yes |
| `GROQ_API_KEY` | Groq API key for KYC OCR | Yes |

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)
- [T3 Stack Documentation](https://create.t3.gg/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.
