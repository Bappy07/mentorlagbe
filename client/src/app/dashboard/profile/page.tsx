
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [plan, setPlan] = useState("free");
  const [role, setRole] = useState("student");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.replace("/sign-in");
  }, [isPending, session, router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<{
          user: {
            name: string;
            phone?: string;
            bio?: string;
            image?: string;
            plan: string;
            role: string;
          };
        }>("/user/me");
        const user = data.user;
        setName(user.name || "");
        setPhone(user.phone || "");
        setBio(user.bio || "");
        setImage(user.image || "");
        setPlan(user.plan || "free");
        setRole(user.role || "student");
      } catch {
        // The session still provides basic profile data.
      }
    }
    if (session) load();
  }, [session]);

  async function uploadImage() {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const data = await apiFetch<{ imageUrl: string }>("/upload/image", {
        method: "POST",
        body: form,
      });
      setImage(data.imageUrl || "");
      toast.success("Image uploaded to ImgBB.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/user/profile", {
        method: "PATCH",
        body: JSON.stringify({ name, phone, bio, image }),
      });
      toast.success("Profile updated successfully.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (isPending || !session) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F5F7F3]">
        <LoaderCircle className="animate-spin text-[#527C69]" size={36} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-[#64736B] hover:text-[#102B25]">
          <ArrowLeft size={17} /> Back to Dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-wider text-[#527C69]">ACCOUNT SETTINGS</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#102B25] sm:text-4xl">Update Profile</h1>
          <p className="mt-3 text-sm text-[#718078]">
            Keep your profile current so tutors and students can recognise you.
          </p>
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-[#E5EBE2] bg-white shadow-sm">
          <div className="bg-[#102B25] px-7 py-8 text-white sm:px-10">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-[#D6F36A] text-2xl font-extrabold text-[#102B25]">
                {image ? (
                  <img src={image} alt={name || "Profile"} className="h-full w-full object-cover" />
                ) : (
                  name.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-extrabold">{name || session.user.name}</h2>
                <p className="mt-1 text-sm text-white/60">{session.user.email}</p>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#D6F36A] px-3 py-1 text-xs font-bold capitalize text-[#102B25]">
                  {role} · {plan} plan
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-7 sm:p-10">
            <label className="block text-sm font-bold text-[#102B25]">
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-[#DCE4DB] px-4 py-3 text-sm font-normal outline-none focus:border-[#527C69]"
              />
            </label>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block text-sm font-bold text-[#102B25]">
                Phone
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+880 1XXX-XXXXXX"
                  className="mt-2 w-full rounded-xl border border-[#DCE4DB] px-4 py-3 text-sm font-normal outline-none focus:border-[#527C69]"
                />
              </label>

              <label className="block text-sm font-bold text-[#102B25]">
                Profile image (ImgBB upload)
                <div className="mt-2 flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                    className="min-w-0 flex-1 rounded-xl border border-[#DCE4DB] px-3 py-2.5 text-xs font-normal"
                  />
                  <button
                    type="button"
                    onClick={uploadImage}
                    disabled={!file || uploading}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#EAF1E5] px-4 text-xs font-bold text-[#527C69] disabled:opacity-50"
                  >
                    <Camera size={16} /> Upload
                  </button>
                </div>
              </label>
            </div>

            <input
              value={image}
              onChange={(event) => setImage(event.target.value)}
              placeholder="Or paste an image URL"
              className="w-full rounded-xl border border-[#DCE4DB] px-4 py-3 text-sm outline-none focus:border-[#527C69]"
            />

            <label className="block text-sm font-bold text-[#102B25]">
              Bio / short introduction
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={4}
                maxLength={1000}
                className="mt-2 w-full rounded-xl border border-[#DCE4DB] px-4 py-3 text-sm font-normal outline-none focus:border-[#527C69]"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 items-center rounded-xl bg-[#102B25] px-6 text-sm font-bold text-white transition hover:bg-[#1B4235] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
