import "~/styles/globals.css";

import { type Metadata } from "next";
import { Providers } from "~/components/providers/providers";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "AidBeacon | Decentralized Disaster Relief",
  description: "Transparent crowdfunding on Base for real-time aid and relief missions.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TRPCReactProvider>
          <Providers>
            {children}
          </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
