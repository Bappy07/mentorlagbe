
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  ArrowRight,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

export default function SignInPage() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Sign in will be connected to Better Auth next.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7F3] px-5 py-14">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[#E5EBE2] bg-white shadow-sm lg:grid-cols-2">
        {/* Left panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#102B25] p-10 text-white lg:flex">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#D6F36A]/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#D6F36A]/10 blur-3xl" />

          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D6F36A] text-[#102B25]">
              <GraduationCap size={27} />
            </div>

            <h1 className="mt-12 text-4xl font-extrabold leading-tight">
              Welcome back.
              <br />
              Your learning
              <span className="text-[#D6F36A]"> journey continues.</span>
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-white/65">
              Sign in to manage your tuition activities, connect with the
              right people, and keep moving toward your goals.
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5">
            <ShieldCheck className="mb-3 text-[#D6F36A]" size={23} />
            <p className="font-semibold">
              Your learning community is waiting.
            </p>
            <p className="mt-2 text-sm text-white/55">
              Pick up where you left off with MentorLagbe.
            </p>
          </div>
        </div>

        {/* Sign-in form */}
        <div className="flex items-center px-6 py-12 sm:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#102B25] text-[#D6F36A]">
                <GraduationCap size={24} />
              </div>
            </div>

            <p className="text-sm font-bold text-[#527C69]">
              WELCOME BACK
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#102B25]">
              Sign in to your account
            </h2>

            <p className="mt-2 text-sm text-[#718078]">
              Enter your credentials to continue.
            </p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-[#102B25]"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#849188]"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-[#E1E8DF] bg-white pl-11 pr-4 text-sm text-[#102B25] outline-none transition placeholder:text-[#A0AAA2] focus:border-[#527C69] focus:ring-2 focus:ring-[#527C69]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-[#102B25]"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#849188]"
                  />

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-[#E1E8DF] bg-white pl-11 pr-4 text-sm text-[#102B25] outline-none transition placeholder:text-[#A0AAA2] focus:border-[#527C69] focus:ring-2 focus:ring-[#527C69]/10"
                  />
                </div>
              </div>

              {message && (
                <p className="rounded-xl bg-[#F0F5E9] p-3 text-sm text-[#527C69]">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#102B25] text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1B4235]"
              >
                Sign In
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-8 border-t border-[#E9EEE7] pt-6">
              <p className="text-center text-sm text-[#718078]">
                Don't have an account?{" "}
                <Link
                  href="/sign-up"
                  className="font-extrabold text-[#102B25] hover:text-[#527C69]"
                >
                  Create account
                </Link>
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#849188]">
              <BookOpen size={15} />
              Learn, connect, and grow with MentorLagbe.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
