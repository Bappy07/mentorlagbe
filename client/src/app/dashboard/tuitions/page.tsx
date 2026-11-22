
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Edit,
  Eye,
  Loader2,
  Plus,
  Power,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Tuition = {
  _id: string;
  title: string;
  description: string;
  classLevel: string;
  subjects: string[];
  location: string;
  salary: number;
  tuitionType: string;
  status: "pending" | "approved" | "rejected";
  approvalStatus?: string;
  isActive?: boolean;
  createdAt: string;
};

export default function MyTuitionsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tuition | null>(null);

  const role = String(
    (session?.user as { role?: string; name?: string; email?: string; image?: string | null; plan?: string } & { role?: string } | undefined)
      ?.role || ""
  );

  async function loadTuitions() {
    try {
      const response = await fetch(`${API_URL}/tuitions`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load tuitions.");
      }

      setTuitions(data.tuitions || []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load tuitions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session && role === "tutor") {
      loadTuitions();
    } else if (!isPending) {
      setLoading(false);
    }
  }, [session, role, isPending]);

  async function toggleActive(tuition: Tuition) {
    const nextStatus = tuition.isActive === false;

    setBusyId(tuition._id);

    try {
      const response = await fetch(
        `${API_URL}/tuitions/${tuition._id}/active`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: nextStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update listing.");
      }

      setTuitions((previous) =>
        previous.map((item) =>
          item._id === tuition._id
            ? { ...item, isActive: nextStatus }
            : item
        )
      );

      toast.success(data.message);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteTuition(id: string) {
    setBusyId(id);

    try {
      const response = await fetch(`${API_URL}/tuitions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete tuition.");
      }

      setTuitions((previous) =>
        previous.filter((tuition) => tuition._id !== id)
      );

      setDeleteTarget(null);
      toast.success(data.message || "Tuition deleted successfully.");
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

  if (!session || role !== "tutor") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F5F7F3] px-4">
        <div className="rounded-2xl border bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-[#102B25]">
            Tutor access required
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Only Tutors can manage tuition listings.
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

  const pending = tuitions.filter(
    (item) => (item.approvalStatus || item.status) === "pending"
  ).length;

  const approved = tuitions.filter(
    (item) => (item.approvalStatus || item.status) === "approved"
  ).length;

  const rejected = tuitions.filter(
    (item) => (item.approvalStatus || item.status) === "rejected"
  ).length;

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
              Tutor Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#102B25]">
              My Tuitions
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your tuition opportunities.
            </p>
          </div>

          <Link
            href="/dashboard/tuitions/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B25] px-5 py-3 font-semibold text-white hover:bg-green-900"
          >
            <Plus className="h-5 w-5" />
            Post Tuition
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Listings", value: tuitions.length },
            { label: "Pending Approval", value: pending },
            { label: "Approved", value: approved },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border bg-white p-5"
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-[#102B25]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {rejected > 0 && (
          <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            You have {rejected} rejected listing(s). Review the details and
            contact the Admin if you need clarification.
          </p>
        )}

        {tuitions.length === 0 ? (
          <div className="rounded-2xl border bg-white px-6 py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-bold text-[#102B25]">
              No tuition listings yet
            </h2>
            <p className="mt-2 text-gray-500">
              Create your first tuition opportunity.
            </p>
            <Link
              href="/dashboard/tuitions/create"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#102B25] px-5 py-3 font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Post a Tuition
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tuitions.map((tuition) => {
              const status = tuition.approvalStatus || tuition.status;
              const isApproved = status === "approved";
              const isBusy = busyId === tuition._id;

              return (
                <article
                  key={tuition._id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            status === "approved"
                              ? "bg-green-100 text-green-800"
                              : status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {status}
                        </span>

                        {isApproved && (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              tuition.isActive === false
                                ? "bg-gray-100 text-gray-700"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {tuition.isActive === false ? "Closed" : "Active"}
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-bold text-[#102B25]">
                        {tuition.title}
                      </h2>

                      <p className="mt-2 text-sm text-gray-500">
                        {tuition.classLevel} · {tuition.subjects.join(", ")}
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        {tuition.tuitionType === "online"
                          ? "Online"
                          : tuition.location}{" "}
                        · ৳{tuition.salary.toLocaleString("en-BD")}/month
                      </p>

                      <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                        {tuition.description}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-start gap-2">
                      <Link
                        href={`/tuitions/${tuition._id}`}
                        className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50"
                        title="View listing"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      {status !== "rejected" && (
                        <Link
                          href={`/dashboard/tuitions/${tuition._id}/edit`}
                          className="rounded-lg border p-2 text-green-800 hover:bg-green-50"
                          title="Edit listing"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      )}

                      {isApproved && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => toggleActive(tuition)}
                          className="rounded-lg border p-2 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                          title={
                            tuition.isActive === false
                              ? "Activate listing"
                              : "Close listing"
                          }
                        >
                          {isBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setDeleteTarget(tuition)}
                        className="rounded-lg border p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title="Delete listing"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102B25]/60 px-4 py-6 backdrop-blur-sm"
          onClick={() => {
            if (!busyId) setDeleteTarget(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="relative w-full max-w-md animate-in fade-in zoom-in-95 rounded-3xl border border-gray-100 bg-white p-7 shadow-2xl duration-200 sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              disabled={!!busyId}
              onClick={() => setDeleteTarget(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
                Delete confirmation
              </p>

              <h2
                id="delete-modal-title"
                className="mt-2 text-2xl font-bold text-[#102B25]"
              >
                Delete this tuition?
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-[#102B25]">
                  &quot;{deleteTarget.title}&quot;
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                disabled={!!busyId}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!!busyId}
                onClick={() => deleteTuition(deleteTarget._id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyId === deleteTarget._id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>

            <p className="mt-5 text-center text-xs text-gray-400">
              This action is permanent and cannot be reversed.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
