
"use client";

import { useEffect, useState } from "react";
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
  transactionId: string;
  paymentStatus: string;
  paidAt: string;
};

export default function AdminTransactionsPage() {
  const { data: session, isPending } = authClient.useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<{ payments: Payment[] }>("/admin/payments");
        setPayments(data.payments || []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    }
    if (!isPending && session?.user?.role === "admin") load();
  }, [isPending, session]);

  if (!isPending && session?.user?.role !== "admin") {
    return <main className="p-10 text-center text-[#102B25]">Admin access required.</main>;
  }

  const revenue = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-bold text-[#64736B] hover:text-[#102B25]">
          <ArrowLeft size={17} /> Admin Overview
        </Link>
        <h1 className="mt-6 text-3xl font-extrabold text-[#102B25]">Stripe Transactions</h1>
        <p className="mt-2 text-sm text-[#718078]">All recorded Pro subscription payments.</p>

        <div className="mt-6 inline-flex rounded-2xl bg-[#102B25] px-6 py-4 text-white">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/60">Revenue in records</p>
            <p className="mt-1 text-2xl font-extrabold">${revenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-[#E5EBE2] bg-white">
          {loading ? (
            <p className="p-10 text-center text-sm text-[#829187]">Loading transactions...</p>
          ) : payments.length === 0 ? (
            <p className="p-10 text-center text-sm text-[#829187]">
              No payments yet. Stripe transactions will appear here after a successful checkout.
            </p>
          ) : (
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#F5F7F3] text-xs uppercase tracking-wider text-[#849188]">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Transaction</th>
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
                      {payment.currency} {Number(payment.amount).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#849188]">{payment.transactionId}</td>
                    <td className="px-5 py-4 text-[#849188]">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "-"}
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
