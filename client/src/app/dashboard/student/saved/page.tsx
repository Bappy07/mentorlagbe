
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

type SavedTuition = {
  _id: string;
  title: string;
  classLevel: string;
  location: string;
  monthlyFee?: number;
  salary?: number;
};

export default function SavedTuitionsPage() {
  const { data: session, isPending } = authClient.useSession();
  const [items, setItems] = useState<SavedTuition[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const saved = await apiFetch<{ savedTuitions: string[] }>("/user/saved");
      const ids = new Set((saved.savedTuitions || []).map(String));
      if (ids.size === 0) {
        setItems([]);
        return;
      }

      const data = await apiFetch<{ tuitions: SavedTuition[] }>("/tuitions/approved?limit=24");
      setItems((data.tuitions || []).filter((tuition) => ids.has(tuition._id)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load saved tuitions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isPending && session?.user?.role === "student") load();
  }, [isPending, session]);

  async function remove(id: string) {
    try {
      await apiFetch(`/user/saved/${id}`, { method: "DELETE" });
      setItems((current) => current.filter((item) => item._id !== id));
      toast.success("Removed from saved tuitions.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove saved tuition.");
    }
  }

  if (!isPending && session?.user?.role !== "student") {
    return <main className="p-10 text-center text-[#102B25]">Student access required.</main>;
  }

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold text-[#102B25]">Saved Tuitions</h1>
        <p className="mt-2 text-sm text-[#718078]">Your shortlist of tuition opportunities.</p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {loading ? (
            <p className="text-sm text-[#829187]">Loading saved tuitions...</p>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DCE5D8] bg-white p-10 text-center md:col-span-2">
              <Bookmark className="mx-auto text-[#829187]" size={32} />
              <p className="mt-4 text-sm text-[#829187]">No saved tuitions yet.</p>
              <Link href="/tuitions" className="mt-5 inline-block rounded-xl bg-[#102B25] px-5 py-3 text-sm font-bold text-white">
                Browse Tuitions
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <article key={item._id} className="rounded-2xl border border-[#E5EBE2] bg-white p-6">
                <h2 className="font-extrabold text-[#102B25]">{item.title}</h2>
                <p className="mt-2 text-xs text-[#849188]">
                  {item.classLevel} · {item.location}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <Link href={`/tuitions/${item._id}`} className="text-sm font-bold text-[#527C69]">
                    View details →
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item._id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
