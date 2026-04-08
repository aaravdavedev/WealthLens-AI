import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WealthLens — AI-Powered Financial Dashboard",
  description: "Intelligent financial analysis powered by AI. Track spending, predict trends, optimize wealth.",
  keywords: ["finance", "AI", "dashboard", "spending analysis", "wealth management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex bg-[#07060E] text-[#F5F0E8]">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
