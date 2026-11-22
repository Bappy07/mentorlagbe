
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function PaymentSuccessPage() {
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState<"loading" | "paid" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSessionId(new URLSearchParams(window.location.search).get("session_id") || "");
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    async function verify() {
      try {
        const data = await apiFetch<{ paid: boolean; plan: string }>(
          `/payments/verify/${encodeURIComponent(sessionId)}`
        );
        if (data.paid) {
          setStatus("paid");
          setMessage(`Your account is now on the ${String(data.plan).toUpperCase()} plan.`);
        } else {
          setStatus("error");
          setMessage("Payment is still processing. Please refresh in a moment.");
        }
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Could not verify payment.");
      }
    }

    verify();
  }, [sessionId]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#F5F7F3] px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-[#E5EBE2] bg-white p-10 text-center shadow-sm">
        {status === "loading" ? (
          <>
            <LoaderCircle className="mx-auto animate-spin text-[#527C69]" size={44} />
            <h1 className="mt-6 text-2xl font-extrabold text-[#102B25]">Confirming your payment</h1>
            <p className="mt-3 text-sm text-[#718078]">Please wait while we verify your Stripe session.</p>
          </>
        ) : status === "paid" ? (
          <>
            <CheckCircle2 className="mx-auto text-[#527C69]" size={52} />
            <h1 className="mt-6 text-3xl font-extrabold text-[#102B25]">You are Pro!</h1>
            <p className="mt-3 text-sm text-[#718078]">{message}</p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex h-12 items-center rounded-xl bg-[#102B25] px-6 text-sm font-bold text-white"
            >
              Go to Dashboard
            </Link>
          </>
        ) : (
          <>
            <XCircle className="mx-auto text-red-500" size={52} />
            <h1 className="mt-6 text-2xl font-extrabold text-[#102B25]">Payment not confirmed</h1>
            <p className="mt-3 text-sm text-[#718078]">{message}</p>
            <Link
              href="/pricing"
              className="mt-8 inline-flex h-12 items-center rounded-xl bg-[#102B25] px-6 text-sm font-bold text-white"
            >
              Back to Pricing
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
