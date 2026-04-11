# AidBeacon - QWEN.md

## Project Overview

**AidBeacon** is a donation crowdfunding platform built on the T3 Stack with Web3 wallet authentication. The platform enables campaigners to raise funds for causes while providing transparent bookkeeping tracking through a multi-step approval workflow.

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with Web3 wallet signature verification (viem)
- **API**: tRPC for type-safe RPC
- **Styling**: Tailwind CSS v4
- **State**: React Query (TanStack), Zustand
- **AI**: Groq SDK for KTP OCR extraction
- **Storage**: Pinata (IPFS) for file uploads
- **Live Streaming**: VideoSDK
- **Web3**: wagmi, viem, OnChainKit

## Building and Running

### Prerequisites

- Node.js 20+
- PostgreSQL database
- API keys for: Groq, Pinata, VideoSDK, OnChainKit

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Server
AUTH_SECRET=<generate with: npx auth secret>
DATABASE_URL=postgresql://postgres:password@localhost:5432/rework-aid-beacon
GROQ_API_KEY=<your key>
VIDEOSDK_SECRET_KEY=<your key>

# Client (NEXT_PUBLIC_)
NEXT_PUBLIC_PINATA_JWT=<your JWT>
NEXT_PUBLIC_GATEWAY_URL=https://gateway.pinata.cloud
NEXT_PUBLIC_VIDEOSDK_API_KEY=<your key>
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<your key>
NEXT_PUBLIC_FACTORY_ADDRESS=<contract address>
NEXT_PUBLIC_IDRX_ADDRESS=<contract address>
```

### Development Commands

```bash
# Development
npm run dev           # Start Next.js dev server (--turbo)
npm run build         # Production build
npm run start         # Start production server
npm run preview       # Build and start

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint errors
npm run typecheck     # TypeScript type checking
npm run check         # Lint + typecheck
npm run format:write  # Format with Prettier
npm run format:check  # Check formatting

# Database
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Apply migrations (production)
npm run db:push       # Push schema changes (dev only)
npm run db:studio     # Open Prisma Studio GUI
```

## Architecture

### Directory Structure

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/              # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/         # Authenticated dashboard pages
│   ├── api/                 # API endpoints (tRPC, NextAuth)
│   └── preview-agreement-form/
├── components/
│   ├── agreements/          # Purchase agreement forms & UI
│   ├── campaign/            # Campaign components
│   ├── kyc/                 # KYC verification components
│   ├── layout/              # Layout components
│   ├── live/                # Live streaming components
│   ├── providers/           # Context providers
│   ├── sections/            # Page sections
│   └── ui/                  # Base UI components
├── server/
│   ├── api/
│   │   ├── routers/         # tRPC routers (campaign, kyc, user)
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── root.ts          # Main tRPC router
│   │   └── trpc.ts          # tRPC context & procedures
│   └── auth/                # NextAuth configuration
├── lib/                     # Utility libraries
├── hooks/                   # React hooks
├── stores/                  # Zustand stores
├── constants/               # App constants
├── types/                   # TypeScript types
├── utils/                   # Utility functions
├── env.js                   # Environment validation (Zod)
└── middleware.ts            # Next.js middleware
```

### tRPC Architecture

Routers are defined in `src/server/api/routers/`:

- **campaignRouter** - Campaign CRUD operations
- **kycRouter** - KYC document upload and status
- **userRouter** - User profile management

Procedures:
- `publicProcedure` - Unauthenticated access
- `protectedProcedure` - Requires authenticated session

Path alias: `~/` → `./src/`

### Database Schema

Main Prisma models (`prisma/schema.prisma`):

- **User** - Wallet-based auth with `DONATUR`/`CAMPAIGNER` roles
- **KycDocument** - KTP verification documents
- **Campaign** - Fundraising campaigns
- **CampaignItem** - Line items in campaigns
- **Invoice** - Proof of purchase invoices
- **InvoiceAttachment** - Uploaded invoice files
- **InvoiceItem** - Line items in invoices

### Bookkeeping Workflow

The system tracks donation spending through a transparent approval process:

1. **PurchaseAgreement** (`DRAFT` → `PENDING_APPROVAL` → `APPROVED`/`REJECTED`)
   - Campaigners create agreements for planned purchases
   - Admins approve/reject before spending

2. **Invoice** (`PENDING_UPLOAD` → `PENDING_VERIFICATION` → `VERIFIED`/`REJECTED`)
   - After approval, campaigners upload invoice/receipt photos
   - Admins verify against the agreement

3. **Transparency** - All verified expenses visible to donors

## Development Conventions

### Code Style

- **TypeScript**: Strict mode enabled, `noUncheckedIndexedAccess`
- **Formatting**: Prettier with Tailwind plugin
- **Linting**: ESLint with Next.js config
- **Imports**: Use path alias `~/` for src directory

### React Patterns

- Default to **Server Components** for data fetching
- Use `'use client'` directive only when hooks or browser APIs are needed
- State management via React Query (server state) and Zustand (client state)

### Validation

- Zod schemas in `src/server/api/schemas/` for all tRPC inputs
- Environment variables validated via `@t3-oss/env-nextjs` in `src/env.js`

### File Uploads

Files uploaded to Pinata (IPFS) via utilities in `src/utils/pinata.ts`.

### Authentication Flow

Web3 wallet-based auth via NextAuth Credentials provider:
1. Frontend signs message with wallet
2. Backend verifies signature using `viem.verifyMessage()`
3. User created/looked up by wallet address
4. Session stored as JWT

## Documentation

Additional documentation available in `docs/`
