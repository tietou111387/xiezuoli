"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/analyze-text", label: "文本拆解" },
  { href: "/my-library", label: "我的素材库" },
  { href: "/guangxi", label: "广西板块", emoji: "🎋" },
  { href: "/hot", label: "每日热点", emoji: "🔥" },
  { href: "/practice", label: "仿写练习" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-primary text-xl">✍️</span>
            <span className="text-primary">写作力</span>
            <span className="text-xs text-gray-400 font-normal hidden sm:inline">
              读懂官媒 · 写透申论
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:text-primary hover:bg-gray-100"
                }`}
              >
                {"emoji" in item && item.emoji ? `${item.emoji} ` : ""}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
