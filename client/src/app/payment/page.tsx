"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock3, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

type PlanKey = "student" | "tutor";

type Instructions = {
  bkashNumber: string;
  currency: string;
  plans: Record<PlanKey, { label: string; amount: number }>;
};

export default function PaymentSubmitPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [instructions, setInstructions] = useState<Instructions | null>(null);
  const [plan, setPlan] = useState<PlanKey>("student");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.push("/sign-in");
      return;
    }

    let active = true;

    async function load() {
      try {
        const [profile, info] = await Promise.all([
          apiFetch<{ user?: { role?: string } }>("/user/me"),
          apiFetch<Instructions>("/payments/instructions"),
        ]);

        if (!active) return;

        setPlan(profile.user?.role === "tutor" ? "tutor" : "student");
        setInstructions(info);
      } catch (error) {
        if (active) {
          toast.error(
            error instanceof Error ? error.message : "Could not load payment details."
          );
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [isPending, session?.user, router]);

  async function copyNumber() {
    if (!instructions?.bkashNumber) return;

    try {
      await navigator.clipboard.writeText(instructions.bkashNumber);
      toast.success("bKash number copied.");
    } catch {
      toast.error("Could not copy the number.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const sender = senderNumber.trim();
    const reference = transactionId.trim().toUpperCase();

    if (!/^01[3-9]\d{8}$/.test(sender)) {
      toast.error("Enter a valid 11-digit bKash sender number.");
      return;
    }

    if (!/^[A-Z0-9]{8,20}$/.test(reference)) {
      toast.error("Enter a valid bKash transaction ID.");
      return;
    }

    setSubmitting(true);

    try {
      await apiFetch("/payments/checkout", {
        method: "POST",
        body: JSON.stringify({
          bkashSenderNumber: sender,
          bkashTransactionId: reference,
        }),
      });

      toast.success("Payment submitted for admin verification.");
      router.push("/payment/success");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit payment.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedPlan = instructions?.plans[plan];

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#64736B] hover:text-[#102B25]"
        >
          <ArrowLeft size={17} /> Back to Pricing
        </Link>

        <div className="mt-6 rounded-3xl border border-[#E5EBE2] bg-white p-7 shadow-sm sm:p-10">
          <h1 className="text-3xl font-extrabold text-[#102B25]">Pay with bKash</h1>
          <p className="mt-3 text-sm leading-7 text-[#718078]">
            Send your Pro membership fee to the bKash number below, then submit
            the sender number and transaction ID. An admin verifies the payment
            before your account is upgraded.
          </p>

          <div className="mt-8 rounded-2xl bg-[#EAF1E5] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#648C45]">
              {selectedPlan?.label ?? "Pro membership"}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-[#102B25]">
              ৳{selectedPlan?.amount ?? "—"}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm text-[#52635A]">
                Send to:{" "}
                <strong className="text-[#102B25]">
                  {instructions?.bkashNumber ?? "Loading..."}
                </strong>
              </span>
              <button
                type="button"
                onClick={copyNumber}
                disabled={!instructions}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#CFDCC9] px-3 text-xs font-bold text-[#527C69] disabled:opacity-50"
              >
                <Copy size={14} /> Copy
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="senderNumber"
                className="block text-sm font-bold text-[#102B25]"
              >
                bKash sender number
              </label>
              <input
                id="senderNumber"
                value={senderNumber}
                onChange={(event) => setSenderNumber(event.target.value)}
                placeholder="01XXXXXXXXX"
                inputMode="numeric"
                maxLength={11}
                className="mt-2 h-12 w-full rounded-xl border border-[#DCE4DB] px-4 text-sm outline-none focus:border-[#527C69]"
              />
            </div>

            <div>
              <label
                htmlFor="transactionId"
                className="block text-sm font-bold text-[#102B25]"
              >
                bKash transaction ID
              </label>
              <input
                id="transactionId"
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                placeholder="ABC123DEF"
                maxLength={20}
                className="mt-2 h-12 w-full rounded-xl border border-[#DCE4DB] px-4 text-sm uppercase outline-none focus:border-[#527C69]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !instructions}
              className="h-12 w-full rounded-xl bg-[#102B25] text-sm font-bold text-white transition hover:bg-[#1B4235] disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Payment Details"}
            </button>
          </form>

          <p className="mt-6 flex items-start gap-2 text-xs leading-6 text-[#829187]">
            <Clock3 size={15} className="mt-0.5 shrink-0" />
            Your plan is based on your account role. Do not send a screenshot;
            the admin verifies the transaction in the bKash account. Pro stays
            inactive until approval.
          </p>
        </div>
      </div>
    </main>
  );
}
