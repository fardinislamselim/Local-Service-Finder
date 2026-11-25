import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { RootLayoutShell } from "@/components/layout/RootLayoutShell";
import { siteConfig } from "@/config/site";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Local Service Finder | Verified Local Services",
    template: `%s | Local Service Finder`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.className} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground flex flex-col" suppressHydrationWarning>
        <Providers>
          <RootLayoutShell>{children}</RootLayoutShell>
        </Providers>
      </body>
    </html>
  );
}
