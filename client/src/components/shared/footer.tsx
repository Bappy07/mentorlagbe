
import Link from "next/link";
import {
  ArrowUpRight,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Home", href: "/" },
    { label: "Browse Tuitions", href: "/tuitions" },
    { label: "Pricing", href: "/#pricing" },
    { label: "How It Works", href: "/#how-it-works" },
  ],
  account: [
    { label: "Sign In", href: "/sign-in" },
    { label: "Create Account", href: "/sign-up" },
    { label: "Become a Tutor", href: "/sign-up" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#102B25] px-5 pt-16 pb-8 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D6F36A] text-[#102B25]">
                <GraduationCap size={25} />
              </div>

              <span className="text-2xl font-extrabold tracking-tight">
                Mentor<span className="text-[#D6F36A]">Lagbe</span>
              </span>
            </Link>

            <p className="mt-6 max-w-xs text-sm leading-7 text-white/55">
              Connecting students with passionate tutors.
              Making quality education and teaching opportunities
              more accessible for everyone.
            </p>

            {/* Social Links */}
            <div className="mt-7 flex items-center gap-3">
              <Link
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (formerly Twitter)"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/65 transition-colors hover:border-[#D6F36A] hover:bg-[#D6F36A] hover:text-[#102B25]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                </svg>
              </Link>

              <Link
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-sm font-bold text-white/65 transition-colors hover:border-[#D6F36A] hover:bg-[#D6F36A] hover:text-[#102B25]"
              >
                f
              </Link>

              <Link
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-lg font-bold text-white/65 transition-colors hover:border-[#D6F36A] hover:bg-[#D6F36A] hover:text-[#102B25]"
              >
                ◎
              </Link>

              <Link
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-sm font-bold text-white/65 transition-colors hover:border-[#D6F36A] hover:bg-[#D6F36A] hover:text-[#102B25]"
              >
                in
              </Link>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-bold text-white">
              Platform
            </h3>

            <ul className="mt-6 space-y-4">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition-colors hover:text-[#D6F36A]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-sm font-bold text-white">
              Get Started
            </h3>

            <ul className="mt-6 space-y-4">
              {footerLinks.account.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition-colors hover:text-[#D6F36A]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-white">
              Get in Touch
            </h3>

            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-[#D6F36A]"
                />
                <span className="text-sm text-white/55">
                  support@mentorlagbe.com
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  size={18}
                  className="mt-0.5 shrink-0 text-[#D6F36A]"
                />
                <span className="text-sm text-white/55">
                  +880 1712-345678
                </span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-[#D6F36A]"
                />
                <span className="text-sm text-white/55">
                  Dhaka, Bangladesh
                </span>
              </div>
            </div>

            <Link
              href="/tuitions"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#D6F36A] transition-colors hover:text-white"
            >
              Explore opportunities
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-4 pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} MentorLagbe. All rights reserved.
          </p>

          <p className="text-xs text-white/40">
            Built to make learning opportunities accessible.
          </p>
        </div>
      </div>
    </footer>
  );
}
