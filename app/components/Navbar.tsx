"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkStyle = (path: string) =>
    pathname === path
      ? "underline underline-offset-4 text-white"
      : "rounded-md px-3 py-1 text-white/90 transition hover:bg-white/15 hover:text-white";

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-blue-900/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          
          {/* Left Links */}
          <nav className="flex items-center gap-8 text-lg font-medium">
            <Link href="/" className={linkStyle("/")}>
              Home
            </Link>
            <Link href="/about" className={linkStyle("/about")}>
              About
            </Link>
            <Link href="/contact" className={linkStyle("/contact")}>
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
