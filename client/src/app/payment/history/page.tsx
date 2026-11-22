"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

type Payment = {
  _id: string;
  planName: string;
  amount: number;
  currency: string;
  bkashTransactionId: string;
  bkashSenderNumber: string;
  paymentStatus: string;
  createdAt: string;
};

export default function PaymentHistoryPage() {
  const { data: session, isPending } = authClient.useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const data = await apiFetch<{ payments: Payment[] }>(
          "/payments/my-payments"
        );
        setPayments(data.payments || []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load payment history.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isPending, session?.user]);

  if (!isPending && !session?.user) {
    return (
      <main className="p-10 text-center text-[#102B25]">Please sign in to view payments.</main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#64736B] hover:text-[#102B25]"
        >
          <ArrowLeft size={17} /> Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold text-[#102B25]">Payment History</h1>
        <p className="mt-2 text-sm text-[#718078]">
          Your bKash submissions and their verification status.
        </p>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-[#E5EBE2] bg-white">
          {loading ? (
            <p className="p-10 text-center text-sm text-[#829187]">Loading payments...</p>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#829187]">
              <p>No payments yet.</p>
              <Link href="/pricing" className="mt-3 inline-block font-bold text-[#527C69]">
                View pricing plans
              </Link>
            </div>
          ) : (
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-[#F5F7F3] text-xs uppercase tracking-wider text-[#849188]">
                <tr>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Transaction</th>
                  <th className="px-5 py-4">Sender</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBE2]">
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-5 py-4 font-bold text-[#102B25]">{payment.planName}</td>
                    <td className="px-5 py-4 font-bold text-[#527C69]">
                      {payment.currency} {Number(payment.amount).toFixed(0)}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#849188]">
                      {payment.bkashTransactionId}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#849188]">
                      {payment.bkashSenderNumber}
                    </td>
                    <td className="px-5 py-4 capitalize text-[#64736B]">
                      {payment.paymentStatus}
                    </td>
                    <td className="px-5 py-4 text-[#849188]">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
