import type { ReactNode } from "react";
import { IBM_Plex_Mono, Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import { ScrollStringCoil } from "@/components/ScrollStringCoil";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { createMetadata } from "@/lib/seo";
import "./globals.css";

const display = Libre_Baskerville({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = createMetadata();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}>
      {/* pb clears the fixed footer so page content is never covered while scrolling */}
      <body className="flex min-h-screen flex-col pb-14 sm:pb-16">
        <ScrollStringCoil />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
