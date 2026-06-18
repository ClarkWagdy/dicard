import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    default: "One.Card — Digital Business Cards",
    template: "%s | One.Card",
  },
  description:
    "Create and share your digital business card instantly with NFC and QR technology.",
  keywords: ["digital business card", "NFC card", "QR card", "one card"],
  authors: [{ name: "One.Card" }],
  creator: "One.Card",
  metadataBase: new URL("https://onecard.app"), // change to your domain
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://onecard.app",
    siteName: "One.Card",
    title: "One.Card — Digital Business Cards",
    description:
      "Create and share your digital business card instantly with NFC and QR technology.",
    images: [
      {
        url: "/og-image.png", // add this image to /public
        width: 1200,
        height: 630,
        alt: "One.Card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "One.Card — Digital Business Cards",
    description:
      "Create and share your digital business card instantly with NFC and QR technology.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/One.svg",
    shortcut: "/OneLogo.png",
    apple: "/OneLogo.png",
  },
  manifest: "/site.webmanifest",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
