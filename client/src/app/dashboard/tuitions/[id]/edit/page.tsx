
"use client";
import { API_URL } from "@/lib/config";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";


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
  preferredGender: "male" | "female" | "any";
};

type Tuition = {
  _id: string;
  title: string;
  description: string;
  classLevel: string;
  subjects: string[];
  tuitionType?: string;
  mode?: string;
  location: string;
  salary?: number;
  monthlyFee?: number;
  daysPerWeek: number;
  hoursPerDay?: number;
  preferredGender?: string;
  status?: string;
  approvalStatus?: string;
};

const initialForm: TuitionForm = {
  title: "",
  description: "",
  classLevel: "",
  subjects: "",
  tuitionType: "home",
  location: "",
  salary: "",
  daysPerWeek: "4",
  hoursPerDay: "2",
  preferredGender: "any",
};

export default function EditTuitionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [form, setForm] = useState<TuitionForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    const role = (
      session.user as { role?: string; name?: string; email?: string; image?: string | null; plan?: string } & { role?: string }
    ).role;

    if (role !== "tutor") {
      router.replace("/dashboard");
      return;
    }

    async function loadTuition() {
      try {
        const response = await fetch(`${API_URL}/tuitions/${params.id}`, {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load tuition.");
        }

        const tuition: Tuition = data.tuition;

        if (!tuition) {
          throw new Error("Tuition not found.");
        }

        const status = tuition.approvalStatus || tuition.status;

        if (status !== "pending") {
          throw new Error("Only pending tuition listings can be edited.");
        }

        const type = (tuition.tuitionType || tuition.mode || "home")
          .toLowerCase();

        setForm({
          title: tuition.title || "",
          description: tuition.description || "",
          classLevel: tuition.classLevel || "",
          subjects: Array.isArray(tuition.subjects)
            ? tuition.subjects.join(", ")
            : "",
          tuitionType: type.includes("online") ? "online" : "home",
          location:
            tuition.location === "Online" ? "" : tuition.location || "",
          salary: String(tuition.salary ?? tuition.monthlyFee ?? ""),
          daysPerWeek: String(tuition.daysPerWeek ?? 4),
          hoursPerDay: String(tuition.hoursPerDay ?? 2),
          preferredGender: (tuition.preferredGender || "any") as
            | "male"
            | "female"
            | "any",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load tuition."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTuition();
  }, [session, isPending, params.id, router]);

  function updateField(name: keyof TuitionForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const subjects = form.subjects
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean);

      if (subjects.length === 0) {
        throw new Error("Please enter at least one subject.");
      }

      const response = await fetch(`${API_URL}/tuitions/${params.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          classLevel: form.classLevel.trim(),
          subjects,
          tuitionType: form.tuitionType,
          location:
            form.tuitionType === "online" ? "Online" : form.location.trim(),
          salary: Number(form.salary),
          daysPerWeek: Number(form.daysPerWeek),
          hoursPerDay: Number(form.hoursPerDay),
          preferredGender: form.preferredGender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update tuition.");
      }

      setSuccess("Tuition updated successfully!");

      setTimeout(() => {
        router.push("/dashboard/tuitions");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update tuition."
      );
    } finally {
      setSaving(false);
    }
  }

  if (isPending || loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </main>
    );
  }

  const role = (
    session?.user as { role?: string; name?: string; email?: string; image?: string | null; plan?: string } & { role?: string }
  )?.role;

  if (!session || role !== "tutor") {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/tuitions"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#102B25]"
        >
          <ArrowLeft size={16} />
          Back to My Tuitions
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#102B25]">
            Edit Tuition
          </h1>
          <p className="mt-2 text-gray-600">
            Update the details of your pending tuition listing.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Tuition Title
            </label>
            <input
              required
              maxLength={120}
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#102B25]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              required
              minLength={20}
              rows={5}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#102B25]"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Class / Level
              </label>
              <input
                required
                value={form.classLevel}
                onChange={(e) => updateField("classLevel", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#102B25]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Subjects (comma separated)
              </label>
              <input
                required
                value={form.subjects}
                onChange={(e) => updateField("subjects", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#102B25]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Tuition Type
            </label>
            <select
              value={form.tuitionType}
              onChange={(e) =>
                updateField("tuitionType", e.target.value as "home" | "online")
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#102B25]"
            >
              <option value="home">Home Tuition</option>
              <option value="online">Online Tuition</option>
            </select>
          </div>

          {form.tuitionType === "home" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Location
              </label>
              <input
                required
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#102B25]"
              />
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Monthly Salary (BDT)
              </label>
              <input
                required
                type="number"
                min="1"
                value={form.salary}
                onChange={(e) => updateField("salary", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#102B25]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Days Per Week
              </label>
              <input
                required
                type="number"
                min="1"
                max="7"
                value={form.daysPerWeek}
                onChange={(e) => updateField("daysPerWeek", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#102B25]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Hours Per Day
              </label>
              <input
                required
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                value={form.hoursPerDay}
                onChange={(e) => updateField("hoursPerDay", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#102B25]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Preferred Tutor Gender
              </label>
              <select
                value={form.preferredGender}
                onChange={(e) =>
                  updateField(
                    "preferredGender",
                    e.target.value as "male" | "female" | "any"
                  )
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#102B25]"
              >
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102B25] px-5 py-3 font-semibold text-white transition hover:bg-[#1b4036] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
