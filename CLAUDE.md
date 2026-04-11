# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AidBeacon - Donasi crowdfunding platform built on T3 Stack with Web3 wallet authentication.

## Tech Stack

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

## Development Commands

```bash
npm run dev          # Start Next.js dev server (--turbo)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run typecheck    # TypeScript type checking
npm run format:write # Format with Prettier
npm run format:check # Check formatting

# Database commands
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Apply migrations
npm run db:push      # Push schema changes (dev only)
npm run db:studio    # Open Prisma Studio
```

## Environment Variables

Required environment variables (see `src/env.js`):

**Server**:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret
- `GROQ_API_KEY` - Groq AI API key
- `VIDEOSDK_SECRET_KEY` - VideoSDK secret

**Client** (NEXT_PUBLIC_):
- `NEXT_PUBLIC_PINATA_JWT` - Pinata JWT token
- `NEXT_PUBLIC_GATEWAY_URL` - Pinata gateway URL
- `NEXT_PUBLIC_VIDEOSDK_API_KEY` - VideoSDK API key
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - Coinbase OnChainKit key
- `NEXT_PUBLIC_FACTORY_ADDRESS` - Smart contract address
- `NEXT_PUBLIC_IDRX_ADDRESS` - Smart contract address

Skip env validation with `SKIP_ENV_VALIDATION=1` (useful for Docker builds).

## Architecture

### Key Directories

```
src/
├── app/                 # Next.js App Router pages & API routes
│   ├── (dashboard)/     # Authenticated dashboard pages
│   ├── (auth)/          # Auth pages (sign-in, sign-up)
│   └── api/             # API endpoints (tRPC, NextAuth)
├── components/          # React components
│   ├── agreements/      # Purchase agreement forms & UI
│   ├── campaign/        # Campaign components
│   ├── kyc/             # KYC verification components
│   ├── layout/          # Layout components
│   ├── providers/       # Context providers
│   └── ui/              # Base UI components
├── server/              # Server-side code
│   ├── api/             # tRPC routers & schemas
│   │   ├── routers/     # Feature routers (kyc, user, agreement, invoice)
│   │   └── schemas/     # Zod validation schemas
│   └── auth/            # NextAuth configuration
├── lib/                 # Utility libraries
├── hooks/               # React hooks
├── stores/              # Zustand stores
├── constants/           # App constants
└── types/               # TypeScript types
```

### tRPC Architecture

Routers are defined in `src/server/api/routers/` and exported in `src/server/api/root.ts`:

- `kycRouter` - KYC document upload and status
- `userRouter` - User profile management
- `agreementRouter` - Purchase agreement CRUD (bookkeeping)
- `invoiceRouter` - Invoice submission and verification

Procedures:
- `publicProcedure` - Unauthenticated access
- `protectedProcedure` - Requires authenticated session

### Authentication

Web3 wallet-based auth via NextAuth Credentials provider:
1. Frontend signs message with wallet
2. Backend verifies signature using `viem.verifyMessage()`
3. User created/looked up by wallet address
4. Session stored as JWT

### Database Schema

Main models (see `prisma/schema.prisma`):
- `User` - Wallet-based auth users with `DONATUR`/`CAMPAIGNER` roles
- `KycDocument` - KTP verification documents
- `Campaign` - Fundraising campaigns
- `PurchaseAgreement` - Bookkeeping agreements
- `AgreementItem` - Line items in agreements
- `Invoice` - Proof of purchase invoices
- `InvoiceAttachment` - Uploaded invoice files

## Bookkeeping System

The system tracks donation spending through a multi-step workflow:

1. **PurchaseAgreement** (DRAFT → PENDING_APPROVAL → APPROVED/REJECTED)
   - Campaigners create agreements for planned purchases
   - Admins approve/reject before spending

2. **Invoice** (PENDING_UPLOAD → PENDING_VERIFICATION → VERIFIED/REJECTED)
   - After approval, campaigners upload invoice/receipt photos
   - Admins verify against the agreement

3. **Transparency** - All verified expenses visible to donors

## Development Patterns

### Path Aliases
- `~/` → `./src/` (configured in tsconfig.json)

### Server Components
Default to Server Components for data fetching. Use `'use client'` directive only when hooks or browser APIs are needed.

### Validation
Zod schemas in `src/server/api/schemas/` validate all tRPC inputs.

### File Uploads
Files uploaded to Pinata (IPFS) via `src/utils/pinata.ts`.

Domains: `backend`, `frontend`, `database`, `auth`, `web3`, etc.
Types: `convention`, `pattern`, `failure`, `decision`, `reference`, `guide`
