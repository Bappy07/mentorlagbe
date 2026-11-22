
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  GraduationCap,
  UserRound,
  Mail,
  LockKeyhole,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { issueToken } from "@/lib/api";
import { APP_URL } from "@/lib/config";
import toast from "react-hot-toast";

export default function SignUpPage() {
  const router = useRouter();

  const [role, setRole] = useState<"student" | "tutor">("student");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name")).trim();
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password"));

    setMessage("");
    setIsError(false);
    setIsLoading(true);

    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setIsError(true);
        setMessage("Please enter a valid email address.");
        return;
      }

      if (password.length < 8) {
        setIsError(true);
        setMessage("Password must be at least 8 characters long.");
        return;
      }

      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        role,
        callbackURL: APP_URL,
      });

      if (error) {
        setIsError(true);
        setMessage(error.message || "Registration failed. Please try again.");
        toast.error(error.message || "Registration failed.");
        return;
      }

      try {
        await issueToken();
      } catch {
        // Cookie session fallback.
      }

      toast.success("Account created! Welcome to MentorLagbe.");
      router.push(`/dashboard/${role}`);
      router.refresh();
    } catch {
      setIsError(true);
      setMessage("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setMessage("");
    setIsError(false);
    setIsGoogleLoading(true);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: APP_URL,
      });

      if (error) {
        setIsError(true);
        setMessage(error.message || "Google sign-up failed.");
        setIsGoogleLoading(false);
        toast.error(error.message || "Google sign-up failed.");
      }
    } catch {
      setIsError(true);
      setMessage("Unable to connect to Google. Please try again.");
      toast.error("Unable to connect to Google. Please try again.");
      setIsGoogleLoading(false);
    }
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
              {/* Role selection */}
              <div>
                <label className="mb-3 block text-sm font-bold text-[#102B25]">
                  I want to join as a
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isLoading || isGoogleLoading}
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
                    disabled={isLoading || isGoogleLoading}
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

              {/* Name */}
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
                    disabled={isLoading || isGoogleLoading}
                    className="h-12 w-full rounded-xl border border-[#E1E8DF] bg-white pl-11 pr-4 text-sm text-[#102B25] outline-none transition placeholder:text-[#A0AAA2] focus:border-[#527C69] focus:ring-2 focus:ring-[#527C69]/10"
                  />
                </div>
              </div>

              {/* Email */}
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
                    disabled={isLoading || isGoogleLoading}
                    className="h-12 w-full rounded-xl border border-[#E1E8DF] bg-white pl-11 pr-4 text-sm text-[#102B25] outline-none transition placeholder:text-[#A0AAA2] focus:border-[#527C69] focus:ring-2 focus:ring-[#527C69]/10"
                  />
                </div>
              </div>

              {/* Password */}
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
                    maxLength={128}
                    placeholder="At least 8 characters"
                    required
                    disabled={isLoading || isGoogleLoading}
                    className="h-12 w-full rounded-xl border border-[#E1E8DF] bg-white pl-11 pr-4 text-sm text-[#102B25] outline-none transition placeholder:text-[#A0AAA2] focus:border-[#527C69] focus:ring-2 focus:ring-[#527C69]/10"
                  />
                </div>
              </div>

              {/* Feedback */}
              {message && (
                <p
                  role="alert"
                  className={`rounded-xl p-3 text-sm ${
                    isError
                      ? "bg-red-50 text-red-700"
                      : "bg-[#F0F5E9] text-[#527C69]"
                  }`}
                >
                  {message}
                </p>
              )}

              {/* Email registration */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#102B25] text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1B4235] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Creating account..." : "Create Account"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E5EBE2]" />
              <span className="text-xs font-medium text-[#849188]">
                OR CONTINUE WITH
              </span>
              <div className="h-px flex-1 bg-[#E5EBE2]" />
            </div>

            {/* Google registration */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading || isGoogleLoading}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#E1E8DF] bg-white text-sm font-bold text-[#102B25] transition hover:bg-[#F5F7F3] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-lg font-extrabold text-[#4285F4]">G</span>
              {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
            </button>

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
