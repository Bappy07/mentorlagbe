
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, PlusCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type TuitionForm = {
  title: string;
  description: string;
  classLevel: string;
  subjects: string;
  tuitionType: "home" | "online";
  location: string;
  salary: string;
  daysPerWeek: string;
  hoursPerDay: string;
  preferredGender: string;
  bannerImage: string;
};

const initialForm: TuitionForm = {
  title: "",
  description: "",
  classLevel: "",
  subjects: "",
  tuitionType: "home",
  location: "",
  salary: "",
  daysPerWeek: "5",
  hoursPerDay: "2",
  preferredGender: "any",
  bannerImage: "",
};

export default function CreateTuitionPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const role = String(
    (session?.user as { role?: string; name?: string; email?: string; image?: string | null; plan?: string } & { role?: string } | undefined)
      ?.role || ""
  );

  function updateField(
    field: keyof TuitionForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function uploadBanner() {
    if (!bannerFile) return;
    setUploadingBanner(true);
    try {
      const data = await apiFetch<{ imageUrl: string }>("/upload/banner", {
        method: "POST",
        body: (() => {
          const form = new FormData();
          form.append("image", bannerFile);
          return form;
        })(),
      });
      updateField("bannerImage", data.imageUrl || "");
      toast.success("Banner uploaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Banner upload failed.");
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      toast.error("Please sign in first.");
      router.push("/sign-in");
      return;
    }

    if (role !== "tutor") {
      toast.error("Only tutors can post tuition.");
      return;
    }

    const subjects = form.subjects
      .split(",")
      .map((subject) => subject.trim())
      .filter(Boolean);

    if (subjects.length === 0) {
      toast.error("Enter at least one subject.");
      return;
    }

    if (form.tuitionType === "home" && !form.location.trim()) {
      toast.error("Enter the tuition location.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/tuitions`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          classLevel: form.classLevel,
          subjects,
          tuitionType: form.tuitionType,
          location:
            form.tuitionType === "online"
              ? "Online"
              : form.location.trim(),
          salary: Number(form.salary),
          daysPerWeek: Number(form.daysPerWeek),
          hoursPerDay: Number(form.hoursPerDay),
          preferredGender: form.preferredGender,
          bannerImage: form.bannerImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeRequired) {
          toast.error(data.message || "Upgrade your plan to post more tuitions.");
          return;
        }

        throw new Error(data.message || "Failed to post tuition.");
      }

      toast.success("Tuition submitted for admin approval.");
      router.push("/dashboard/tuitions");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  if (isPending) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </main>
    );
  }

  if (!session || role !== "tutor") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F5F7F3] px-4">
        <div className="max-w-md rounded-2xl border bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-[#102B25]">
            Tutor access required
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Only registered Tutors can create tuition listings.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-xl bg-[#102B25] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            Tutor Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#102B25]">
            Post a Tuition
          </h1>
          <p className="mt-2 text-gray-600">
            Share your tuition opportunity and connect with students.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Tuition Title *
            </label>
            <input
              required
              maxLength={120}
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="e.g. Mathematics tutor for Class 10 student"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description *
            </label>
            <textarea
              required
              minLength={20}
              rows={5}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Describe the tuition, student requirements and learning goals..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Class / Level *
              </label>
              <select
                required
                value={form.classLevel}
                onChange={(event) =>
                  updateField("classLevel", event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-700"
              >
                <option value="">Select class</option>
                {[
                  "Class 1-5",
                  "Class 6",
                  "Class 7",
                  "Class 8",
                  "Class 9",
                  "Class 10",
                  "SSC",
                  "HSC",
                  "Admission",
                  "University",
                ].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Subjects *
              </label>
              <input
                required
                value={form.subjects}
                onChange={(event) =>
                  updateField("subjects", event.target.value)
                }
                placeholder="Math, Physics, Chemistry"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple subjects with commas.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Tuition Mode *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["home", "online"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => updateField("tuitionType", mode)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize ${
                    form.tuitionType === mode
                      ? "border-green-800 bg-green-50 text-green-900"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  {mode === "home" ? "Home Tuition" : "Online Tuition"}
                </button>
              ))}
            </div>
          </div>

          {form.tuitionType === "home" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Location *
              </label>
              <input
                required
                value={form.location}
                onChange={(event) =>
                  updateField("location", event.target.value)
                }
                placeholder="e.g. Uttara, Dhaka"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              />
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Monthly Salary (BDT) *
              </label>
              <input
                required
                type="number"
                min="1"
                value={form.salary}
                onChange={(event) => updateField("salary", event.target.value)}
                placeholder="5000"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Days Per Week *
              </label>
              <select
                required
                value={form.daysPerWeek}
                onChange={(event) =>
                  updateField("daysPerWeek", event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-700"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <option key={day} value={day}>
                    {day} days
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Hours Per Day *
              </label>
              <input
                required
                type="number"
                min="1"
                max="12"
                step="0.5"
                value={form.hoursPerDay}
                onChange={(event) =>
                  updateField("hoursPerDay", event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Preferred Tutor Gender
              </label>
              <select
                value={form.preferredGender}
                onChange={(event) =>
                  updateField("preferredGender", event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-700"
              >
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Banner Image (upload via ImgBB)
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setBannerFile(event.target.files?.[0] || null)}
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm"
              />
              <button
                type="button"
                onClick={uploadBanner}
                disabled={!bannerFile || uploadingBanner}
                className="rounded-xl bg-[#EAF1E5] px-5 py-3 text-sm font-semibold text-[#527C69] disabled:opacity-50"
              >
                {uploadingBanner ? "Uploading..." : "Upload Banner"}
              </button>
            </div>
            {form.bannerImage && (
              <p className="mt-2 break-all text-xs text-green-700">Banner ready: {form.bannerImage}</p>
            )}
          </div>

          <div className="rounded-xl bg-[#F0F5ED] p-4 text-sm text-gray-700">
            <p className="font-semibold text-[#102B25]">
              Admin approval required
            </p>
            <p className="mt-1">
              Your tuition listing will be reviewed by an Admin before it
              becomes visible to Students.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102B25] px-5 py-4 font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <PlusCircle className="h-5 w-5" />
                Submit Tuition
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
