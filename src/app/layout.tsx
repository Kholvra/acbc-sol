import "@coinbase/onchainkit/styles.css";
import "~/styles/globals.css";

import { type Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { Providers } from "~/components/providers/providers";
import { wagmiConfig } from "~/components/providers/providers";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "AidBeacon | Decentralized Disaster Relief",
  description: "Transparent crowdfunding on Base for real-time aid and relief missions.",
  icons: [
    { rel: "icon", url: "/images/logo-aidbeacon.png", type: "image/png", sizes: "32x32" },
    { rel: "apple-touch-icon", url: "/images/logo-aidbeacon.png" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialState = cookieToInitialState(
    wagmiConfig,
    (await headers()).get("cookie"),
  );

  return (
    <html lang="en">
      <body className="antialiased selection:bg-aid-yellow selection:text-aid-dark">
        <TRPCReactProvider>
          <Providers initialState={initialState}>
            {children}
          </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
