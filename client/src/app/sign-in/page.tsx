
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  ArrowRight,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { issueToken } from "@/lib/api";
import { APP_URL } from "@/lib/config";
import toast from "react-hot-toast";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    try {
      const { error, data } = await authClient.signIn.email({
        email,
        password,
        callbackURL: APP_URL,
      });

      if (error) {
        setMessage(error.message || "Invalid email or password.");
        toast.error(error.message || "Invalid email or password.");
        return;
      }

      try {
        await issueToken();
      } catch {
        // Cookie sessions still work as a fallback on protected routes.
      }

      const role = String((data?.user as { role?: string } | undefined)?.role || "student");
      toast.success("Welcome back to MentorLagbe!");
      router.push(role === "student" || role === "tutor" || role === "admin" ? `/dashboard/${role}` : "/dashboard");
      router.refresh();
    } catch {
      setMessage("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setMessage("");
    setIsGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: APP_URL,
      });
    } catch {
      setMessage("Google sign-in failed. Please try again.");
      toast.error("Google sign-in failed. Please try again.");
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
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
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
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-[#E1E8DF] bg-white pl-11 pr-4 text-sm text-[#102B25] outline-none transition placeholder:text-[#A0AAA2] focus:border-[#527C69] focus:ring-2 focus:ring-[#527C69]/10"
                  />
                </div>
              </div>

              {message && (
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#102B25] text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#1B4235] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Signing in..." : "Sign In"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E9EEE7]" />
              <span className="text-xs font-medium text-[#849188]">
                OR CONTINUE WITH
              </span>
              <div className="h-px flex-1 bg-[#E9EEE7]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#E1E8DF] bg-white text-sm font-bold text-[#102B25] transition hover:bg-[#F5F7F3] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-lg font-extrabold text-[#4285F4]">G</span>
              {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
            </button>

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
