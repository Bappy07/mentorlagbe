
"use client";
import { API_URL } from "@/lib/config";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";


type Tuition = {
  _id: string;
  title: string;
  classLevel: string;
  subjects: string[];
  location: string;
  salary: number;
  tuitionType: string;
  description: string;
  tutorName?: string;
  tutorEmail?: string;
};

type Stats = {
  totalUsers: number;
  students: number;
  tutors: number;
  totalTuitions: number;
  pendingTuitions: number;
  approvedTuitions: number;
  totalApplications: number;
  totalPayments: number;
};

const emptyStats: Stats = {
  totalUsers: 0,
  students: 0,
  tutors: 0,
  totalTuitions: 0,
  pendingTuitions: 0,
  approvedTuitions: 0,
  totalApplications: 0,
  totalPayments: 0,
};

export default function AdminDashboard() {
  const { data: session, isPending } = authClient.useSession();

  const [stats, setStats] = useState<Stats>(emptyStats);
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const role = String(
    (session?.user as { role?: string; name?: string; email?: string; image?: string | null; plan?: string } & { role?: string } | undefined)
      ?.role || ""
  );

  async function loadDashboard() {
    setLoading(true);

    try {
      const [statsResponse, tuitionResponse] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, {
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`${API_URL}/admin/tuitions/pending`, {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const statsData = await statsResponse.json();
      const tuitionData = await tuitionResponse.json();

      if (!statsResponse.ok) {
        throw new Error(statsData.message || "Failed to load statistics.");
      }

      if (!tuitionResponse.ok) {
        throw new Error(tuitionData.message || "Failed to load pending tuitions.");
      }

      setStats({ ...emptyStats, ...statsData.stats });
      setTuitions(tuitionData.tuitions || []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session && role === "admin") {
      loadDashboard();
    } else if (!isPending) {
      setLoading(false);
    }
  }, [session, role, isPending]);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setBusyId(id);

    try {
      const response = await fetch(
        `${API_URL}/admin/tuitions/${id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update tuition.");
      }

      setTuitions((previous) =>
        previous.filter((tuition) => tuition._id !== id)
      );

      setStats((previous) => ({
        ...previous,
        pendingTuitions: Math.max(0, previous.pendingTuitions - 1),
        approvedTuitions:
          status === "approved"
            ? previous.approvedTuitions + 1
            : previous.approvedTuitions,
      }));

      toast.success(data.message || `Tuition ${status} successfully.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setBusyId(null);
    }
  }

  if (isPending || loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </main>
    );
  }

  if (!session || role !== "admin") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F5F7F3] px-4">
        <div className="max-w-md rounded-2xl border bg-white p-8 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-bold text-[#102B25]">
            Admin access only
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            You need an Admin account to access this dashboard.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-block rounded-xl bg-[#102B25] px-5 py-3 text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users },
    { label: "Students", value: stats.students, icon: Users },
    { label: "Tutors", value: stats.tutors, icon: Users },
    { label: "Total Tuitions", value: stats.totalTuitions, icon: BookOpen },
    { label: "Pending Approval", value: stats.pendingTuitions, icon: Clock },
    { label: "Approved Tuitions", value: stats.approvedTuitions, icon: CheckCircle },
    { label: "Applications", value: stats.totalApplications, icon: BookOpen },
    { label: "Payments", value: stats.totalPayments, icon: CheckCircle },
  ];

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
              Platform Management
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#102B25]">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage users, tuition listings and platform activity.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-[#102B25] hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <Icon className="h-5 w-5 text-green-700" />
                </div>
                <p className="mt-3 text-3xl font-bold text-[#102B25]">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#102B25]">
                Tuition Approval
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review tutor listings before publishing them.
              </p>
            </div>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
              {tuitions.length} Pending
            </span>
          </div>

          {tuitions.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="mt-4 text-lg font-bold text-[#102B25]">
                All caught up!
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                There are no tuition listings waiting for approval.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tuitions.map((tuition) => {
                const isBusy = busyId === tuition._id;

                return (
                  <article
                    key={tuition._id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row">
                      <div className="min-w-0 flex-1">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          Pending review
                        </span>

                        <h3 className="mt-4 text-lg font-bold text-[#102B25]">
                          {tuition.title}
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                          {tuition.classLevel} · {tuition.subjects?.join(", ")}
                        </p>

                        <p className="mt-2 text-sm text-gray-600">
                          {tuition.tuitionType === "online"
                            ? "Online"
                            : tuition.location}{" "}
                          · ৳{tuition.salary?.toLocaleString("en-BD")}/month
                        </p>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                          {tuition.description}
                        </p>

                        {tuition.tutorName && (
                          <p className="mt-3 text-sm text-gray-500">
                            Tutor: <strong>{tuition.tutorName}</strong>
                            {tuition.tutorEmail && ` · ${tuition.tutorEmail}`}
                          </p>
                        )}

                        <Link
                          href={`/tuitions/${tuition._id}`}
                          className="mt-4 inline-block text-sm font-semibold text-green-800 hover:underline"
                        >
                          View listing details →
                        </Link>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                        <button
                          disabled={isBusy}
                          onClick={() => updateStatus(tuition._id, "approved")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B25] px-5 py-3 font-semibold text-white hover:bg-green-900 disabled:opacity-50"
                        >
                          {isBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Approve
                        </button>

                        <button
                          disabled={isBusy}
                          onClick={() => updateStatus(tuition._id, "rejected")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
