import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuctionProvider } from "@/lib/auction-context";
import { EditAuthProvider } from "@/providers/EditAuthProvider";
import { EditAccessControl } from "@/components/EditAccessControl";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SCL-2026 Auction App",
  description: "Cricket auction management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuctionProvider>
          <EditAuthProvider>
            {children}
            <EditAccessControl />
          </EditAuthProvider>
        </AuctionProvider>
      </body>
    </html>
  );
}
