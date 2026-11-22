
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

type UserRow = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const { data: session, isPending } = authClient.useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await apiFetch<{ users: UserRow[] }>("/admin/users");
      setUsers(data.users || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isPending && session?.user?.role !== "admin") return;
    load();
  }, [isPending, session]);

  async function changeRole(user: UserRow, role: string) {
    try {
      const data = await apiFetch(`/admin/users/${encodeURIComponent(user._id || user.id || "")}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      toast.success(data.message || "Role updated.");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role.");
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
        <h1 className="mt-6 text-3xl font-extrabold text-[#102B25]">User Management</h1>
        <p className="mt-2 text-sm text-[#718078]">Review all accounts and update user roles.</p>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-[#E5EBE2] bg-white">
          {loading ? (
            <p className="p-10 text-center text-sm text-[#829187]">Loading users...</p>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#F5F7F3] text-xs uppercase tracking-wider text-[#849188]">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBE2]">
                {users.map((user, index) => (
                  <tr key={user._id || user.id || index}>
                    <td className="px-5 py-4 font-bold text-[#102B25]">{user.name}</td>
                    <td className="px-5 py-4 text-[#64736B]">{user.email}</td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        onChange={(event) => changeRole(user, event.target.value)}
                        className="rounded-lg border border-[#DCE4DB] px-3 py-2 text-xs font-bold text-[#102B25]"
                      >
                        <option value="student">student</option>
                        <option value="tutor">tutor</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 capitalize text-[#527C69]">{user.plan || "free"}</td>
                    <td className="px-5 py-4 text-[#849188]">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-[#849188]">
          <ShieldCheck size={14} /> Role changes take effect on the next API request.
        </p>
      </div>
    </main>
  );
}
