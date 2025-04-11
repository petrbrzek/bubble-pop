import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bubble Pop - A Relaxing Bubble Popping Game",
  description: "Enjoy a satisfying bubble popping experience with beautiful translucent bubbles, immersive audio, and challenging gameplay. Pop bubbles directly or swipe through multiple bubbles Fruit Ninja style!",
  keywords: ["bubble pop", "game", "relaxing game", "bubble popping", "web game", "browser game"],
  authors: [{ name: "Bubble Pop Team" }],
  creator: "Bubble Pop Team",
  publisher: "Bubble Pop",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Bubble Pop - A Relaxing Bubble Popping Game",
    description: "Enjoy a satisfying bubble popping experience with beautiful translucent bubbles, immersive audio, and challenging gameplay.",
    url: "https://bubble-pop.vercel.app",
    siteName: "Bubble Pop",
    images: [
      {
        url: "https://assets.macaly-user-data.dev/jfl9hdqnp4bk63xoek9djime/qqv0wbjmfyzv0s40bdz0a5m2/zcN_2gk2ZsLxaL4_Z-s2P/tmpczpra9dt.webp",
        width: 1200,
        height: 630,
        alt: "Bubble Pop Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bubble Pop - A Relaxing Bubble Popping Game",
    description: "Enjoy a satisfying bubble popping experience with beautiful translucent bubbles, immersive audio, and challenging gameplay.",
    images: ["https://assets.macaly-user-data.dev/jfl9hdqnp4bk63xoek9djime/qqv0wbjmfyzv0s40bdz0a5m2/zcN_2gk2ZsLxaL4_Z-s2P/tmpczpra9dt.webp"],
    creator: "@bubblepopgame",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
        <body className={inter.className}>{children}</body>
    </html>
  );
}