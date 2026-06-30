import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "写作力 — 从读懂官媒到写透申论",
  description:
    "AI驱动的写作能力提升工具。自动采集官媒文章，多层级深度拆解，行测联动学习，多模式仿写练习，帮你从读懂到会写。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
