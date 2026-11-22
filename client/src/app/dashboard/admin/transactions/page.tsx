"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

type Payment = {
  _id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  planName: string;
  amount: number;
  currency: string;
  bkashTransactionId: string;
  bkashSenderNumber: string;
  paymentStatus: string;
  createdAt: string;
  rejectionReason?: string;
};

function isApproved(payment: Payment) {
  return payment.paymentStatus === "completed" || payment.paymentStatus === "paid";
}

function statusClass(status: string) {
  if (status === "completed" || status === "paid") return "text-[#527C69]";
  if (status === "pending") return "text-[#B45309]";
  return "text-red-600";
}

export default function AdminTransactionsPage() {
  const { data: session, isPending } = authClient.useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pending, setPending] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    try {
      const [all, waiting] = await Promise.all([
        apiFetch<{ payments: Payment[] }>("/admin/payments"),
        apiFetch<{ payments: Payment[] }>("/payments/admin/pending"),
      ]);

      setPayments(all.payments || []);
      setPending(waiting.payments || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && session?.user?.role === "admin") load();
  }, [isPending, session, load]);

  async function review(paymentId: string, action: "approve" | "reject") {
    const message =
      action === "approve"
        ? "Have you verified this transaction in your bKash account? Approving will activate Pro."
        : "Reject this payment submission?";

    if (!window.confirm(message)) return;

    setBusyId(paymentId);

    try {
      await apiFetch(`/payments/admin/${paymentId}/${action}`, {
        method: "PATCH",
        ...(action === "reject"
          ? { body: JSON.stringify({ reason: "Payment could not be verified." }) }
          : {}),
      });

      toast.success(
        action === "approve" ? "Payment approved. Pro activated." : "Payment rejected."
      );
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update payment.");
    } finally {
      setBusyId("");
    }
  }

  if (!isPending && session?.user?.role !== "admin") {
    return <main className="p-10 text-center text-[#102B25]">Admin access required.</main>;
  }

  const revenue = payments
    .filter(isApproved)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-bold text-[#64736B] hover:text-[#102B25]">
          <ArrowLeft size={17} /> Admin Overview
        </Link>
        <h1 className="mt-6 text-3xl font-extrabold text-[#102B25]">bKash Transactions</h1>
        <p className="mt-2 text-sm text-[#718078]">
          Verify pending submissions manually, then review all recorded payments.
        </p>

        <div className="mt-6 inline-flex rounded-2xl bg-[#102B25] px-6 py-4 text-white">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/60">Approved revenue</p>
            <p className="mt-1 text-2xl font-extrabold">BDT {revenue.toFixed(0)}</p>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-extrabold text-[#102B25]">
            Pending verification ({pending.length})
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-[#E5EBE2] bg-white">
            {loading ? (
              <p className="p-10 text-center text-sm text-[#829187]">Loading payments...</p>
            ) : pending.length === 0 ? (
              <p className="p-10 text-center text-sm text-[#829187]">
                No payments are waiting for verification.
              </p>
            ) : (
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-[#F5F7F3] text-xs uppercase tracking-wider text-[#849188]">
                  <tr>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Plan</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Transaction</th>
                    <th className="px-5 py-4">Sender</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EBE2]">
                  {pending.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-5 py-4 font-bold text-[#102B25]">{payment.userName}</td>
                      <td className="px-5 py-4 font-bold text-[#527C69]">{payment.planName}</td>
                      <td className="px-5 py-4 font-bold text-[#102B25]">
                        {payment.currency} {Number(payment.amount).toFixed(0)}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#849188]">
                        {payment.bkashTransactionId}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#849188]">
                        {payment.bkashSenderNumber}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => review(payment._id, "approve")}
                            disabled={busyId === payment._id}
                            className="rounded-lg bg-[#527C69] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => review(payment._id, "reject")}
                            disabled={busyId === payment._id}
                            className="rounded-lg border border-[#DCE4DB] px-3 py-2 text-xs font-bold text-[#64736B] disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-extrabold text-[#102B25]">All payments</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-[#E5EBE2] bg-white">
            {loading ? (
              <p className="p-10 text-center text-sm text-[#829187]">Loading transactions...</p>
            ) : payments.length === 0 ? (
              <p className="p-10 text-center text-sm text-[#829187]">
                No payments yet. bKash submissions will appear here.
              </p>
            ) : (
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-[#F5F7F3] text-xs uppercase tracking-wider text-[#849188]">
                  <tr>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Role</th>
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
                      <td className="px-5 py-4 font-bold text-[#102B25]">{payment.userName}</td>
                      <td className="px-5 py-4 text-[#64736B]">{payment.userEmail}</td>
                      <td className="px-5 py-4 capitalize text-[#64736B]">{payment.userRole}</td>
                      <td className="px-5 py-4 font-bold text-[#527C69]">{payment.planName}</td>
                      <td className="px-5 py-4 font-bold text-[#102B25]">
                        {payment.currency} {Number(payment.amount).toFixed(0)}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#849188]">
                        {payment.bkashTransactionId}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#849188]">
                        {payment.bkashSenderNumber}
                      </td>
                      <td className={`px-5 py-4 font-bold capitalize ${statusClass(payment.paymentStatus)}`}>
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
        </section>
      </div>
    </main>
  );
}
