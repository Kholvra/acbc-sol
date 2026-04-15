# AidBeacon 🚨

A decentralized disaster relief and crowdfunding platform built on the Base blockchain (Ethereum L2). AidBeacon enables transparent, real-time fundraising for disaster relief efforts through blockchain-verified campaigns, live streaming, and crypto donations.

## ✨ Features

- **🔐 Wallet-Based Authentication** — Sign in with Ethereum wallet (Coinbase Wallet or injected providers) using signature verification
- **📱 TikTok-Style Campaign Feed** — Swipeable, full-screen vertical feed for discovering and donating to disaster relief campaigns
- **⚡ Quick Donate** — Swipe-to-donate 1000 IDRX (stablecoin) with support for batch transactions (EIP-5792)
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
- **[wagmi](https://wagmi.sh/)** — React hooks for Ethereum
- **[viem](https://viem.sh/)** — Ethereum client library
- **[@coinbase/onchainkit](https://onchainkit.xyz/)** — Coinbase wallet UI components
- **Base Sepolia** — Testnet for development
- **Smart Contracts** — Factory pattern for campaign creation, ERC-20 (IDRX) for donations

### Backend
- **[tRPC v11](https://trpc.io/)** — End-to-end type-safe API
- **[NextAuth.js v5](https://next-auth.js.org/)** — Wallet signature authentication
- **[Prisma ORM v6](https://prisma.io/)** — Type-safe database queries
- **[PostgreSQL](https://www.postgresql.org/)** — Relational database

### AI / Storage / Video
- **[Groq](https://groq.com/)** — LLM inference for KTP OCR extraction
- **[Pinata](https://www.pinata.cloud/)** — IPFS storage for campaign metadata and media
- **[VideoSDK.live](https://www.videosdk.live/)** — Live streaming infrastructure

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (via Docker)
- MetaMask or Coinbase Wallet browser extension

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

4. **Start PostgreSQL database**
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
├── prisma/
│   ├── schema.prisma          # Database models (User, Campaign, KYC, etc.)
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Protected routes (dashboard, campaigns, live, etc.)
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth endpoint
│   │   │   └── trpc/          # tRPC API endpoint
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── agreements/        # Purchase agreement forms
│   │   ├── campaign/          # Campaign cards, creation, swipe gestures
│   │   ├── live/              # Live streaming components
│   │   ├── kyc/               # KYC verification UI
│   │   ├── explore/           # Interactive map
│   │   ├── sections/          # Landing page sections
│   │   └── ui/                # Reusable UI primitives
│   ├── server/
│   │   ├── api/               # tRPC routers and schemas
│   │   ├── auth/              # NextAuth configuration
│   │   └── db.ts              # Prisma client singleton
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities (AI, video, storage)
│   ├── constants/             # Contract addresses, app constants
│   └── env.js                 # Environment variable validation
├── generated/                 # Generated files (Prisma client)
└── public/                    # Static assets
```

## 🗄️ Database Schema

- **User** — Wallet-based user accounts with roles (DONATUR, CAMPAIGNER, ADMIN)
- **KycDocument** — Identity verification records (KTP)
- **Campaign** — Off-chain campaign metadata linked to on-chain contracts
- **CampaignItem** — Budget line items for campaigns
- **PurchaseAgreement** — Expense tracking with admin approval workflow
- **AgreementItem** — Line items within purchase agreements
- **Invoice** — Invoices linked to approved agreements
- **InvoiceAttachment** — File attachments for invoices

## 🔗 Smart Contracts

The platform interacts with Base Sepolia testnet:

- **Factory Contract** — Creates new campaign contracts
- **Campaign Contract** — Per-campaign contract handling donations and metadata
- **IDRX Token** — ERC-20 stabletoken used for donations

## 🔐 Authentication

1. User connects wallet (Coinbase Wallet or injected provider)
2. Frontend builds a message with wallet address + timestamp
3. User signs the message (free, no gas required)
4. Backend verifies signature using `viem.verifyMessage`
5. User is looked up or created in database by address
6. JWT session created with 24-hour max age

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run database migrations
```

### Database Management

```bash
./start-database.sh  # Start PostgreSQL with Docker
npx prisma studio    # Open Prisma Studio (database GUI)
```

## 🚢 Deployment

Follow deployment guides for:

- **[Vercel](https://create.t3.gg/en/deployment/vercel)** — Recommended for Next.js
- **[Netlify](https://create.t3.gg/en/deployment/netlify)**
- **[Docker](https://create.t3.gg/en/deployment/docker)**

### Environment Variables for Production

Ensure all required environment variables are set in your deployment platform. Pay special attention to:

- `AUTH_SECRET` — Generate a secure random string
- `DATABASE_URL` — Point to your production PostgreSQL instance
- `GROQ_API_KEY` — Required for KYC verification
- Smart contract addresses must match your deployed contracts

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [wagmi Documentation](https://wagmi.sh/)
- [Base Documentation](https://docs.base.org/)
- [T3 Stack Documentation](https://create.t3.gg/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.
