
"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/#how-it-works" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5EBE2] bg-[#F5F7F3]/95 backdrop-blur-md">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102B25] text-[#D6F36A]">
            <GraduationCap size={23} />
          </div>

          <span className="text-xl font-extrabold tracking-tight text-[#102B25]">
            Mentor<span className="text-[#527C69]">Lagbe</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-[#64736B] transition-colors hover:text-[#102B25]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/sign-in"
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#102B25] transition-colors hover:bg-[#EAF1E5]"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            className="rounded-xl bg-[#102B25] px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1B4235]"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#102B25] transition-colors hover:bg-[#EAF1E5] lg:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-[#E5EBE2] bg-white px-5 py-5 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#52635A] transition-colors hover:bg-[#F0F5E9] hover:text-[#102B25]"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#E5EBE2] pt-4">
              <Link
                href="/sign-in"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-[#DCE4DB] px-4 py-3 text-sm font-bold text-[#102B25] transition-colors hover:bg-[#F5F7F3]"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center rounded-xl bg-[#102B25] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1B4235]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
