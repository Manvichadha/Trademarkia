import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SHEET — Collaborative Grid",
  description:
    "A real-time, obsidian-dark collaborative spreadsheet that feels like it shipped from 2035.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-bg-base text-text-primary">
      <body
        className={`${syne.variable} ${dmSans.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

