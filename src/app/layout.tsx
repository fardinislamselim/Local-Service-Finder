import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { Outfit } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
});


export const metadata: Metadata = {
  title: {
    default: "ServiceFinder | Local Service Finder System",
    template: `%s | ServiceFinder`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.className} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
