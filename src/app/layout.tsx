import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Big_Shoulders_Display } from "next/font/google";
import "./globals.css";
import { AuctionProvider } from "@/lib/auction-context";
import { EditAuthProvider } from "@/providers/EditAuthProvider";
import { ToastProvider } from "@/components/ui/toast";
import { SEASON } from "@/lib/constants";

const display = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
});

const condensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-condensed",
});

const sans = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: `${SEASON.short} Season ${SEASON.season} Auction`,
  description: `${SEASON.league} ${SEASON.year} player auction`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${condensed.variable}`}>
      <body className="font-sans">
        <AuctionProvider>
          <EditAuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </EditAuthProvider>
        </AuctionProvider>
      </body>
    </html>
  );
}
