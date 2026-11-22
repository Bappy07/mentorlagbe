
"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpenCheck,
  FileText,
  Users,
  ClipboardList,
  CreditCard,
  UserRound,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const links: Record<string, { label: string; href: string; icon: typeof LayoutDashboard }[]> = {
  student: [
    { label: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "My Applications", href: "/dashboard/student/my-applications", icon: FileText },
    { label: "Saved Tuitions", href: "/dashboard/student/saved", icon: BookOpenCheck },
  ],
  tutor: [
    { label: "Overview", href: "/dashboard/tutor", icon: LayoutDashboard },
    { label: "Post a Tuition", href: "/dashboard/tutor/post-tuition", icon: FileText },
    { label: "My Tuitions", href: "/dashboard/tutor/my-tuitions", icon: BookOpenCheck },
    { label: "Applicants", href: "/dashboard/tutor/applicants", icon: Users },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Tuitions", href: "/dashboard/admin/tuitions", icon: ClipboardList },
    { label: "Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Transactions", href: "/dashboard/admin/transactions", icon: CreditCard },
  ],
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const role = String(session?.user?.role || "student");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = [
    ...(links[role] || links.student),
    { label: "Update Profile", href: "/dashboard/profile", icon: UserRound },
  ];

  const user = session?.user;

  function sidebar() {
    return (
      <aside className={`${collapsed ? "w-20" : "w-64"} shrink-0 border-r border-[#E5EBE2] bg-white transition-all duration-200`}>
        <div className="flex h-16 items-center gap-2 border-b border-[#E5EBE2] px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#102B25] text-[#D6F36A]">
            <GraduationCap size={20} />
          </div>
          {!collapsed && (
            <span className="text-sm font-extrabold text-[#102B25]">
              Mentor<span className="text-[#527C69]">Lagbe</span>
            </span>
          )}
        </div>

        <nav className="space-y-1 p-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-[#102B25] text-white"
                    : "text-[#64736B] hover:bg-[#EAF1E5] hover:text-[#102B25]"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#F5F7F3]">
      <div className="hidden lg:block">{sidebar()}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full overflow-y-auto">{sidebar()}</div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-4 z-20 rounded-xl bg-white p-2 text-[#102B25]"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-[#E5EBE2] bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-[#DCE4DB] p-2 text-[#102B25] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="hidden rounded-xl border border-[#DCE4DB] p-2 text-[#102B25] lg:block"
              aria-label="Toggle sidebar"
            >
              <Menu size={19} />
            </button>
            <div>
              <p className="text-sm font-extrabold capitalize text-[#102B25]">
                {role} workspace
              </p>
              <p className="hidden text-xs text-[#849188] sm:block">MentorLagbe dashboard</p>
            </div>
          </div>

          <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-xl border border-[#E5EBE2] py-1.5 pl-1.5 pr-3">
            {user?.image ? (
              <img src={user.image} alt={user.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D6F36A] text-xs font-extrabold text-[#102B25]">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
            <span className="hidden text-xs font-bold text-[#102B25] sm:block">{user?.name || "Guest"}</span>
          </Link>
        </header>

        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
