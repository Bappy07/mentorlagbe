
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Application = {
  _id: string;
  tuitionId: string;
  tuitionTitle: string;
  tutorName?: string;
  tutorEmail?: string;
  status: "pending" | "accepted" | "rejected";
  preferredSchedule?: string;
  studentNote?: string;
  createdAt: string;
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const user = session?.user as
    | ({ role?: string; name?: string; email?: string; image?: string | null; plan?: string } & { role?: string })
    | undefined;

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/applications`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load applications.");
      }

      setApplications(data.applications || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    if (user?.role !== "student") {
      setLoading(false);
      return;
    }

    fetchApplications();
  }, [session, isPending, user?.role, router, fetchApplications]);

  const cancelApplication = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this application?")) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`${API_URL}/applications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel application.");
      }

      setApplications((previous) =>
        previous.filter((application) => application._id !== id)
      );

      toast.success("Application cancelled successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (user?.role !== "student") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold text-[#102B25]">
          Student access only
        </h2>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-green-700 hover:underline"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const pendingCount = applications.filter(
    (application) => application.status === "pending"
  ).length;

  const acceptedCount = applications.filter(
    (application) => application.status === "accepted"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "rejected"
  ).length;

  const statusStyles = {
    pending: "bg-amber-50 text-amber-700",
    accepted: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
  };

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#102B25]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
              Student Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#102B25]">
              My Applications
            </h1>

            <p className="mt-2 text-gray-500">
              Track your tuition applications and their status.
            </p>
          </div>

          <Link
            href="/tuitions"
            className="inline-flex items-center justify-center rounded-lg bg-[#102B25] px-5 py-3 text-sm font-semibold text-white hover:bg-green-900"
          >
            Browse Tuitions
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Total Applications</p>
            <p className="mt-2 text-3xl font-bold text-[#102B25]">
              {applications.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Accepted</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {acceptedCount}
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#102B25]">
            Your Applications
          </h2>

          <button
            type="button"
            onClick={fetchApplications}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={fetchApplications}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {!error && applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <BookOpen
              className="mx-auto text-gray-400"
              size={42}
            />

            <h3 className="mt-4 text-xl font-bold text-[#102B25]">
              No applications yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              You haven't applied for any tuition opportunities yet.
              Browse available tuitions and submit your first application.
            </p>

            <Link
              href="/tuitions"
              className="mt-6 inline-flex rounded-lg bg-[#102B25] px-5 py-3 font-semibold text-white hover:bg-green-900"
            >
              Explore Tuitions
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <article
                key={application._id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        statusStyles[application.status]
                      }`}
                    >
                      {application.status}
                    </span>

                    <h3 className="mt-3 text-xl font-bold text-[#102B25]">
                      {application.tuitionTitle}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      Tutor: {application.tutorName || "Not available"}
                    </p>

                    {application.tutorEmail && (
                      <p className="mt-1 text-sm text-gray-500">
                        {application.tutorEmail}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/tuitions/${application.tuitionId}`}
                    className="inline-flex h-fit items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-[#102B25] hover:bg-green-50"
                  >
                    View Tuition
                  </Link>
                </div>

                {application.preferredSchedule && (
                  <div className="mt-5 rounded-xl bg-[#F5F7F3] p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#102B25]">
                      <CalendarDays size={16} />
                      Preferred Schedule
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      {application.preferredSchedule}
                    </p>
                  </div>
                )}

                {application.studentNote && (
                  <div className="mt-3 rounded-xl bg-[#F5F7F3] p-4">
                    <p className="text-sm font-semibold text-[#102B25]">
                      Your Note
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {application.studentNote}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={16} />
                    Applied:{" "}
                    {new Date(application.createdAt).toLocaleDateString()}
                  </span>

                  {application.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => cancelApplication(application._id)}
                      disabled={deletingId === application._id}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === application._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Cancel Application
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
