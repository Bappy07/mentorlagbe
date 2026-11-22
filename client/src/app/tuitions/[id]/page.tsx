
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  BookOpen,
  Wallet,
  GraduationCap,
  Clock,
  Monitor,
  House,
  CheckCircle2,
  Loader2,
  Send,
  Bookmark,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Tuition = {
  _id: string;
  title: string;
  description: string;
  classLevel: string;
  subjects: string[];
  location: string;
  salary?: number;
  monthlyFee?: number;
  daysPerWeek: number;
  hoursPerDay?: number;
  tuitionType?: string;
  mode?: string;
  preferredGender?: string;
  approvalStatus?: string;
  status?: string;
  isActive: boolean;
  createdAt?: string;
};

export default function TuitionDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: session, isPending } = authClient.useSession();

  const [tuition, setTuition] = useState<Tuition | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [phone, setPhone] = useState("");
  const [preferredSchedule, setPreferredSchedule] = useState("");
  const [studentNote, setStudentNote] = useState("");

  const loadTuition = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/tuitions/${id}`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Tuition listing not found.");
      }

      setTuition(data.tuition);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load tuition."
      );
      setTuition(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadTuition();
    }
  }, [id, loadTuition]);

  async function handleSave() {
    if (!session) {
      toast.error("Please sign in to save tuitions.");
      return;
    }
    try {
      await apiFetch(`/user/saved/${id}`, { method: "POST" });
      toast.success("Saved to your shortlist.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save tuition.");
    }
  }

  const handleApply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!phone.trim() || !preferredSchedule.trim()) {
      toast.error("Please complete your phone number and preferred schedule.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/applications/${id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
          preferredSchedule: preferredSchedule.trim(),
          studentNote: studentNote.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit application.");
      }

      toast.success("Your application was submitted successfully.");

      setPhone("");
      setPreferredSchedule("");
      setStudentNote("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-green-700" />
      </div>
    );
  }

  if (!tuition) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <BookOpen size={48} className="mb-4 text-gray-400" />

        <h1 className="text-2xl font-bold text-[#102B25]">
          Tuition Not Found
        </h1>

        <p className="mt-2 max-w-md text-sm text-gray-500">
          This listing may have been removed, closed, or is not available to
          your account.
        </p>

        <Link
          href="/tuitions"
          className="mt-6 rounded-xl bg-[#102B25] px-5 py-3 text-sm font-bold text-white hover:bg-[#1B4235]"
        >
          Browse Tuitions
        </Link>
      </main>
    );
  }

  const role = (
    session?.user as { role?: string; name?: string; email?: string; image?: string | null; plan?: string } & { role?: string }
  )?.role;

  const isStudent = role === "student";
  const isTutor = role === "tutor";
  const isAdmin = role === "admin";

  const tuitionType = tuition.tuitionType || tuition.mode || "Not specified";
  const salary = tuition.salary ?? tuition.monthlyFee ?? 0;

  const postedAt = tuition.createdAt
    ? new Date(tuition.createdAt).toLocaleDateString("en-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-5 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/tuitions"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#527C69] transition-colors hover:text-[#102B25]"
        >
          <ArrowLeft size={17} />
          Back to tuition listings
        </Link>

        <button
          type="button"
          onClick={handleSave}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#DCE4DB] bg-white px-4 py-2.5 text-sm font-bold text-[#527C69] transition hover:border-[#527C69]"
        >
          <Bookmark size={16} /> Save this tuition
        </button>

        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_350px]">
          <section className="rounded-3xl border border-[#E5EBE2] bg-white p-7 sm:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#EAF1E5] px-3 py-1.5 text-xs font-bold text-[#527C69]">
                {tuitionType} Tuition
              </span>

              <span className="text-xs font-medium text-[#829187]">
                Posted {postedAt}
              </span>
            </div>

            <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-[#102B25] sm:text-4xl">
              {tuition.title}
            </h1>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#64736B]">
              <span className="flex items-center gap-2">
                <GraduationCap size={17} />
                {tuition.classLevel}
              </span>

              <span className="flex items-center gap-2">
                <MapPin size={17} />
                {tuition.location}
              </span>
            </div>

            <div className="my-8 border-t border-[#E5EBE2]" />

            <h2 className="text-lg font-extrabold text-[#102B25]">
              Tuition Overview
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#64736B]">
              {tuition.description}
            </p>

            <h2 className="mt-9 text-lg font-extrabold text-[#102B25]">
              Required Subjects
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {tuition.subjects?.map((subject) => (
                <span
                  key={subject}
                  className="rounded-lg bg-[#F0F5E9] px-4 py-2 text-sm font-semibold text-[#527C69]"
                >
                  {subject}
                </span>
              ))}
            </div>

            <div className="my-8 border-t border-[#E5EBE2]" />

            <h2 className="text-lg font-extrabold text-[#102B25]">
              Tuition Requirements
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3 text-sm text-[#64736B]">
                <CheckCircle2 size={18} className="text-[#648C45]" />
                Comfortable teaching {tuition.classLevel}
              </div>

              <div className="flex items-center gap-3 text-sm text-[#64736B]">
                <CheckCircle2 size={18} className="text-[#648C45]" />
                Knowledge of {tuition.subjects?.join(", ")}
              </div>

              <div className="flex items-center gap-3 text-sm text-[#64736B]">
                <CheckCircle2 size={18} className="text-[#648C45]" />
                Available {tuition.daysPerWeek} days per week
              </div>

              {tuition.hoursPerDay && (
                <div className="flex items-center gap-3 text-sm text-[#64736B]">
                  <CheckCircle2 size={18} className="text-[#648C45]" />
                  {tuition.hoursPerDay} hours per day
                </div>
              )}

              {tuition.preferredGender && (
                <div className="flex items-center gap-3 text-sm text-[#64736B]">
                  <CheckCircle2 size={18} className="text-[#648C45]" />
                  Preferred tutor: {tuition.preferredGender}
                </div>
              )}
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-[#E5EBE2] bg-white p-7">
            <p className="text-sm font-semibold text-[#829187]">
              Monthly Salary
            </p>

            <p className="mt-2 text-4xl font-extrabold tracking-tight text-[#102B25]">
              ৳{salary.toLocaleString("en-BD")}
            </p>

            <p className="mt-1 text-xs text-[#829187]">Per month</p>

            <div className="my-7 border-t border-[#E5EBE2]" />

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F5E9] text-[#527C69]">
                  <BookOpen size={19} />
                </div>
                <div>
                  <p className="text-xs text-[#829187]">Class level</p>
                  <p className="text-sm font-bold text-[#102B25]">
                    {tuition.classLevel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F5E9] text-[#527C69]">
                  {tuitionType.toLowerCase().includes("online") ? (
                    <Monitor size={19} />
                  ) : (
                    <House size={19} />
                  )}
                </div>
                <div>
                  <p className="text-xs text-[#829187]">Tuition type</p>
                  <p className="text-sm font-bold text-[#102B25]">
                    {tuitionType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F5E9] text-[#527C69]">
                  <CalendarDays size={19} />
                </div>
                <div>
                  <p className="text-xs text-[#829187]">Days per week</p>
                  <p className="text-sm font-bold text-[#102B25]">
                    {tuition.daysPerWeek} days
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F5E9] text-[#527C69]">
                  <Clock size={19} />
                </div>
                <div>
                  <p className="text-xs text-[#829187]">Posted</p>
                  <p className="text-sm font-bold text-[#102B25]">
                    {postedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F5E9] text-[#527C69]">
                  <Wallet size={19} />
                </div>
                <div>
                  <p className="text-xs text-[#829187]">Monthly salary</p>
                  <p className="text-sm font-bold text-[#102B25]">
                    ৳{salary.toLocaleString("en-BD")}
                  </p>
                </div>
              </div>
            </div>

            <div className="my-7 border-t border-[#E5EBE2]" />

            {!session && (
              <>
                <Link
                  href="/sign-in"
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-[#102B25] text-sm font-bold text-white transition-all hover:bg-[#1B4235]"
                >
                  Sign In to Apply
                </Link>

                <p className="mt-4 text-center text-xs leading-5 text-[#829187]">
                  Sign in with a Student account to apply.
                </p>
              </>
            )}

            {session && isStudent && (
              <form onSubmit={handleApply} className="space-y-4">
                <h2 className="text-lg font-extrabold text-[#102B25]">
                  Apply for This Tuition
                </h2>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-[#64736B]"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="01XXXXXXXXX"
                    required
                    className="w-full rounded-xl border border-[#DCE5DA] px-4 py-3 text-sm outline-none focus:border-[#527C69]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="schedule"
                    className="mb-2 block text-sm font-semibold text-[#64736B]"
                  >
                    Preferred Schedule
                  </label>
                  <input
                    id="schedule"
                    type="text"
                    value={preferredSchedule}
                    onChange={(event) =>
                      setPreferredSchedule(event.target.value)
                    }
                    placeholder="e.g. 5 PM – 7 PM, Sun–Thu"
                    required
                    className="w-full rounded-xl border border-[#DCE5DA] px-4 py-3 text-sm outline-none focus:border-[#527C69]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="studentNote"
                    className="mb-2 block text-sm font-semibold text-[#64736B]"
                  >
                    Additional Note
                  </label>
                  <textarea
                    id="studentNote"
                    value={studentNote}
                    onChange={(event) => setStudentNote(event.target.value)}
                    placeholder="Tell the tutor about your learning needs..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-[#DCE5DA] px-4 py-3 text-sm outline-none focus:border-[#527C69]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#102B25] text-sm font-bold text-white transition-all hover:bg-[#1B4235] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={17} />
                  )}
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            )}

            {session && isTutor && (
              <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                Tutor accounts cannot apply for tuition listings. You can
                manage your own listings from your dashboard.
              </p>
            )}

            {session && isAdmin && (
              <p className="rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                Admin accounts cannot apply for tuition listings.
              </p>
            )}

            {session && !isStudent && !isTutor && !isAdmin && (
              <p className="rounded-xl bg-gray-100 p-4 text-sm text-gray-600">
                Your account does not have permission to apply.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
