"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Payment = {
  _id: string;
  planName: string;
  amount: number;
  currency: string;
  bkashTransactionId: string;
  paymentStatus: string;
  createdAt: string;
};

export default function PaymentSuccessPage() {
  const [payment, setPayment] = useState<Payment | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLatest() {
      try {
        const data = await apiFetch<{ payments: Payment[] }>(
          "/payments/my-payments"
        );
        if (active) setPayment(data.payments?.[0] ?? null);
      } catch {
        // The message below is sufficient even if the history call fails.
      }
    }

    loadLatest();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#F5F7F3] px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-[#E5EBE2] bg-white p-10 text-center shadow-sm">
        <Clock3 className="mx-auto text-[#527C69]" size={52} />
        <h1 className="mt-6 text-3xl font-extrabold text-[#102B25]">
          Payment submitted
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#718078]">
          Your bKash payment details were received. Pro access will activate
          only after an admin verifies the transaction.
        </p>

        {payment && (
          <div className="mt-7 rounded-2xl bg-[#F5F7F3] p-5 text-left text-sm">
            <div className="flex justify-between gap-4 py-1">
              <span className="text-[#829187]">Plan</span>
              <span className="font-bold text-[#102B25]">{payment.planName}</span>
            </div>
            <div className="flex justify-between gap-4 py-1">
              <span className="text-[#829187]">Amount</span>
              <span className="font-bold text-[#102B25]">
                {payment.currency} {Number(payment.amount).toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between gap-4 py-1">
              <span className="text-[#829187]">Transaction</span>
              <span className="font-bold text-[#102B25]">
                {payment.bkashTransactionId}
              </span>
            </div>
            <div className="flex justify-between gap-4 py-1">
              <span className="text-[#829187]">Status</span>
              <span className="font-bold capitalize text-[#B45309]">
                {payment.paymentStatus}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center rounded-xl bg-[#102B25] px-6 text-sm font-bold text-white"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/payment/history"
            className="inline-flex h-12 items-center rounded-xl border border-[#DCE4DB] px-6 text-sm font-bold text-[#102B25]"
          >
            Payment History
          </Link>
        </div>
      </div>
    </main>
  );
}
