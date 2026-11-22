
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Application = {
  _id: string;
  id?: string;
  tuitionId: string;
  tuitionTitle?: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  preferredSchedule?: string;
  studentNote?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: string;
};

export default function ManageApplicantsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/applications/tutor`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load applications.");
      }

      setApplications(data.applications || []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && session) {
      loadApplications();
    }

    if (!isPending && !session) {
      setLoading(false);
    }
  }, [isPending, session, loadApplications]);

  const updateStatus = async (
    applicationId: string,
    status: "accepted" | "rejected"
  ) => {
    setUpdatingId(applicationId);

    try {
      const response = await fetch(
        `${API_URL}/applications/${applicationId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update application.");
      }

      setApplications((previous) =>
        previous.map((application) =>
          (application._id || application.id) === applicationId
            ? { ...application, status }
            : application
        )
      );

      toast.success(
        status === "accepted"
          ? "Application accepted successfully."
          : "Application rejected."
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
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
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Please sign in to continue.</p>
        <Link
          href="/sign-in"
          className="rounded-lg bg-[#102B25] px-5 py-3 text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const role = (session.user as { role?: string; name?: string; email?: string; image?: string | null; plan?: string } & {
    role?: string;
  }).role;

  if (role !== "tutor") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold text-[#102B25]">
          Tutor access only
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

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-800"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            Tutor Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#102B25]">
            Manage Applications
          </h1>
          <p className="mt-2 text-gray-500">
            Review students who applied to your tuition listings.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
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

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {rejectedCount}
            </p>
          </div>
        </div>

        <h2 className="mb-5 text-lg font-bold text-[#102B25]">
          Student Applications
        </h2>

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <User className="mx-auto mb-4 text-gray-400" size={42} />
            <h3 className="text-lg font-bold text-[#102B25]">
              No applications yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Student applications will appear here when someone applies to
              your approved tuition listings.
            </p>
            <Link
              href="/dashboard/tuitions"
              className="mt-6 inline-flex rounded-lg bg-[#102B25] px-5 py-3 text-sm font-semibold text-white hover:bg-green-900"
            >
              View My Tuitions
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const applicationId = application._id || application.id || "";

              const statusStyle = {
                pending: "bg-amber-50 text-amber-700",
                accepted: "bg-green-50 text-green-700",
                rejected: "bg-red-50 text-red-700",
              }[application.status];

              return (
                <article
                  key={applicationId}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-5 sm:flex-row">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle}`}
                        >
                          {application.status}
                        </span>

                        {application.createdAt && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={13} />
                            {new Date(
                              application.createdAt
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-[#102B25]">
                        {application.tuitionTitle || "Tuition Application"}
                      </h3>

                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <p>
                          <strong>Student:</strong>{" "}
                          {application.studentName || "Not provided"}
                        </p>
                        <p>
                          <strong>Email:</strong>{" "}
                          {application.studentEmail || "Not provided"}
                        </p>
                        <p>
                          <strong>Phone:</strong>{" "}
                          {application.studentPhone || "Not provided"}
                        </p>
                        <p>
                          <strong>Preferred Schedule:</strong>{" "}
                          {application.preferredSchedule || "Not provided"}
                        </p>
                      </div>

                      {application.studentNote && (
                        <div className="mt-4 rounded-lg bg-gray-50 p-4">
                          <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                            Student's Note
                          </p>
                          <p className="text-sm text-gray-700">
                            {application.studentNote}
                          </p>
                        </div>
                      )}
                    </div>

                    {application.status === "pending" && (
                      <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                        <button
                          type="button"
                          disabled={updatingId === applicationId}
                          onClick={() =>
                            updateStatus(applicationId, "accepted")
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                        >
                          {updatingId === applicationId ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                          Accept
                        </button>

                        <button
                          type="button"
                          disabled={updatingId === applicationId}
                          onClick={() =>
                            updateStatus(applicationId, "rejected")
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
