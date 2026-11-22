
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

type TuitionRow = {
  _id: string;
  title: string;
  tutorName: string;
  tutorEmail: string;
  approvalStatus: string;
  status?: string;
  monthlyFee?: number;
  createdAt: string;
};

export default function AdminTuitionsPage() {
  const { data: session, isPending } = authClient.useSession();
  const [tuitions, setTuitions] = useState<TuitionRow[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await apiFetch<{ tuitions: TuitionRow[] }>(
        `/admin/tuitions${filter ? `?status=${filter}` : ""}`
      );
      setTuitions(data.tuitions || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load tuitions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isPending && session?.user?.role === "admin") load();
  }, [isPending, session, filter]);

  async function moderate(id: string, status: "approved" | "rejected") {
    try {
      const data = await apiFetch(`/admin/tuitions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(data.message || "Tuition updated.");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update tuition.");
    }
  }

  if (!isPending && session?.user?.role !== "admin") {
    return <main className="p-10 text-center text-[#102B25]">Admin access required.</main>;
  }

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-bold text-[#64736B] hover:text-[#102B25]">
          <ArrowLeft size={17} /> Admin Overview
        </Link>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#102B25]">Tuition Approval Flow</h1>
            <p className="mt-2 text-sm text-[#718078]">Approve or reject every tutor listing.</p>
          </div>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-[#DCE4DB] bg-white px-4 py-3 text-sm font-bold text-[#102B25]"
          >
            <option value="">All listings</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {loading ? (
            <p className="text-sm text-[#829187]">Loading tuitions...</p>
          ) : tuitions.length === 0 ? (
            <p className="text-sm text-[#829187]">No tuitions found.</p>
          ) : (
            tuitions.map((tuition) => {
              const status = tuition.approvalStatus || tuition.status || "pending";
              return (
                <article key={tuition._id} className="rounded-2xl border border-[#E5EBE2] bg-white p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-extrabold text-[#102B25]">{tuition.title}</h2>
                    <span className="rounded-full bg-[#EAF1E5] px-3 py-1 text-xs font-bold capitalize text-[#527C69]">
                      {status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#849188]">
                    {tuition.tutorName} · {tuition.tutorEmail}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => moderate(tuition._id, "approved")}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#102B25] px-4 py-2.5 text-xs font-bold text-white"
                    >
                      <Check size={15} /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => moderate(tuition._id, "rejected")}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600"
                    >
                      <X size={15} /> Reject
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
