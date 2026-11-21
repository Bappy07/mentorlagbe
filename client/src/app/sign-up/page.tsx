
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  GraduationCap,
  UserRound,
  Mail,
  LockKeyhole,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function SignUpPage() {
  const [role, setRole] = useState<"student" | "tutor">("student");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Registration will be connected to Better Auth next.");
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
              Your next chapter
              <br />
              starts with the
              <span className="text-[#D6F36A]"> right mentor.</span>
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-white/65">
              Join MentorLagbe to discover learning opportunities, connect
              with experienced tutors, and make progress toward your goals.
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5">
            <BookOpen className="mb-3 text-[#D6F36A]" size={23} />
            <p className="font-semibold">
              Better learning starts with the right connection.
            </p>
            <p className="mt-2 text-sm text-white/55">
              Find opportunities. Share knowledge. Grow together.
            </p>
          </div>
        </div>

        {/* Sign-up form */}
        <div className="px-6 py-10 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#102B25] text-[#D6F36A]">
                <GraduationCap size={24} />
              </div>
            </div>

            <p className="text-sm font-bold text-[#527C69]">
              CREATE YOUR ACCOUNT
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#102B25]">
              Get started
            </h2>

            <p className="mt-2 text-sm text-[#718078]">
              Join the MentorLagbe community today.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-3 block text-sm font-bold text-[#102B25]">
                  I want to join as a
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                      role === "student"
                        ? "border-[#102B25] bg-[#F0F5E9]"
                        : "border-[#E5EBE2] hover:border-[#A9B9A9]"
                    }`}
                  >
                    <UserRound
                      size={21}
                      className={
                        role === "student"
                          ? "text-[#102B25]"
                          : "text-[#849188]"
                      }
                    />
                    <span>
                      <span className="block text-sm font-bold text-[#102B25]">
                        Student
                      </span>
                      <span className="mt-0.5 block text-xs text-[#718078]">
                        Find a tutor
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("tutor")}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                      role === "tutor"
                        ? "border-[#102B25] bg-[#F0F5E9]"
                        : "border-[#E5EBE2] hover:border-[#A9B9A9]"
                    }`}
                  >
                    <GraduationCap
                      size={22}
                      className={
                        role === "tutor"
                          ? "text-[#102B25]"
                          : "text-[#849188]"
                      }
                    />
                    <span>
                      <span className="block text-sm font-bold text-[#102B25]">
                        Tutor
                      </span>
                      <span className="mt-0.5 block text-xs text-[#718078]">
                        Teach students
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-[#102B25]"
                >
                  Full name
                </label>
                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#849188]"
                  />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    className="h-12 w-full rounded-xl border border-[#E1E8DF] bg-white pl-11 pr-4 text-sm text-[#102B25] outline-none transition placeholder:text-[#A0AAA2] focus:border-[#527C69] focus:ring-2 focus:ring-[#527C69]/10"
                  />
                </div>
              </div>

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
                    minLength={8}
                    placeholder="At least 8 characters"
                    required
                    className="h-12 w-full rounded-xl border border-[#E1E8DF] bg-white pl-11 pr-4 text-sm text-[#102B25] outline-none transition placeholder:text-[#A0AAA2] focus:border-[#527C69] focus:ring-2 focus:ring-[#527C69]/10"
                  />
                </div>
              </div>

              <input type="hidden" name="role" value={role} />

              {message && (
                <p className="rounded-xl bg-[#F0F5E9] p-3 text-sm text-[#527C69]">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#102B25] text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1B4235]"
              >
                Create Account
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#718078]">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-extrabold text-[#102B25] hover:text-[#527C69]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
