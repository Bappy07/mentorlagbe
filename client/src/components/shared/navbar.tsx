
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Menu,
  X,
  UserRound,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearToken } from "@/lib/api";
import toast from "react-hot-toast";
import ThemeToggle from "./theme-toggle";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/#how-it-works" },
];

export default function Navbar() {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const role = user?.role || "student";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setSignOutError("");

    try {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(
          result.error.message || "Unable to sign out. Please try again."
        );
      }

      clearToken();
      setIsProfileOpen(false);
      setIsMenuOpen(false);
      toast.success("Signed out successfully.");

      router.replace("/");
      router.refresh();
    } catch (error) {
      setSignOutError(
        error instanceof Error
          ? error.message
          : "Logout failed. Please try again."
      );

      setIsSigningOut(false);
    }
  }

  function getInitial(name?: string) {
    return name?.charAt(0).toUpperCase() || "U";
  }

  const showLoading = !isMounted || isPending;

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

        {/* Theme toggle */}
        <div className="ml-auto mr-3 lg:ml-0">
          <ThemeToggle />
        </div>

        {/* Desktop Authentication */}
        <div className="hidden items-center gap-3 lg:flex">
          {showLoading ? (
            <div className="h-10 w-28 animate-pulse rounded-xl bg-[#E5EBE2]" />
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-[#EAF1E5]"
                aria-expanded={isProfileOpen}
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-10 w-10 rounded-full border border-[#DCE4DB] object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#102B25] text-sm font-bold text-[#D6F36A]">
                    {getInitial(user.name)}
                  </div>
                )}

                <div className="text-left">
                  <p className="max-w-28 truncate text-sm font-bold text-[#102B25]">
                    {user.name}
                  </p>

                  <p className="text-xs capitalize text-[#718078]">
                    {role}
                  </p>
                </div>

                <ChevronDown size={16} className="text-[#718078]" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-[#E5EBE2] bg-white p-2 shadow-xl">
                  <div className="border-b border-[#E9EEE7] px-3 py-3">
                    <p className="truncate text-sm font-bold text-[#102B25]">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-[#849188]">
                      {user.email}
                    </p>

                    <span className="mt-2 inline-block rounded-full bg-[#F0F5E9] px-2.5 py-1 text-xs font-bold capitalize text-[#527C69]">
                      {role}
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#52635A] hover:bg-[#F0F5E9] hover:text-[#102B25]"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#52635A] hover:bg-[#F0F5E9] hover:text-[#102B25]"
                  >
                    <UserRound size={17} />
                    My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    <LogOut size={17} />
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}
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

      {/* Logout Error */}
      {signOutError && (
        <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-center text-sm text-red-600">
          {signOutError}
        </div>
      )}

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

            {showLoading ? (
              <div className="mt-3 h-12 animate-pulse rounded-xl bg-[#E5EBE2]" />
            ) : user ? (
              <>
                <div className="mt-3 flex items-center gap-3 border-t border-[#E5EBE2] px-4 pt-4">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="h-11 w-11 rounded-full border border-[#DCE4DB] object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#102B25] font-bold text-[#D6F36A]">
                      {getInitial(user.name)}
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-bold text-[#102B25]">
                      {user.name}
                    </p>

                    <p className="text-xs capitalize text-[#718078]">
                      {role}
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#52635A] hover:bg-[#F0F5E9]"
                >
                  <LayoutDashboard size={17} />
                  Dashboard
                </Link>

                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#52635A] hover:bg-[#F0F5E9]"
                >
                  <UserRound size={17} />
                  My Profile
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <LogOut size={17} />
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </button>
              </>
            ) : (
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
            )}
          </div>
        </div>
      )}
    </header>
  );
}
