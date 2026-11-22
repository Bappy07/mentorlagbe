
"use client";

import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Users,
  PlusCircle,
  FileText,
  CreditCard,
  ShieldCheck,
  Settings,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const dashboardLinks = {
  student: [
    {
      title: "Browse Tuitions",
      description: "Find the right tutor for your learning journey.",
      href: "/tuitions",
      icon: BookOpen,
    },
    {
      title: "My Applications",
      description: "Track your tuition applications and their status.",
      href: "/dashboard/applications",
      icon: FileText,
    },
    {
      title: "Pro Membership",
      description: "Explore premium features and upgrade your plan.",
      href: "/pricing",
      icon: CreditCard,
    },
    {
      title: "My Profile",
      description: "View and manage your account information.",
      href: "/dashboard/profile",
      icon: Settings,
    },
  ],

  tutor: [
    {
      title: "My Tuitions",
      description: "Manage your tuition listings and approval status.",
      href: "/dashboard/tuitions",
      icon: BookOpen,
    },
    {
      title: "Post New Tuition",
      description: "Create a new tuition listing for students.",
      href: "/dashboard/tuitions/create",
      icon: PlusCircle,
    },
    {
      title: "Manage Applicants",
      description: "Review and manage student applications.",
      href: "/dashboard/applicants",
      icon: Users,
    },
    {
      title: "Pro Membership",
      description: "Upgrade your account for more opportunities.",
      href: "/pricing",
      icon: CreditCard,
    },
    {
      title: "My Profile",
      description: "View and manage your account information.",
      href: "/dashboard/profile",
      icon: Settings,
    },
  ],

  admin: [
    {
      title: "Admin Panel",
      description: "View platform statistics and pending approvals.",
      href: "/dashboard/admin",
      icon: ShieldCheck,
    },
    {
      title: "Manage Tuitions",
      description: "Review and moderate tuition listings.",
      href: "/dashboard/admin",
      icon: BookOpen,
    },
    {
      title: "Manage Users",
      description: "Manage student and tutor accounts.",
      href: "/dashboard/admin",
      icon: Users,
    },
    {
      title: "Payments",
      description: "Review platform payment information.",
      href: "/dashboard/admin",
      icon: CreditCard,
    },
  ],
};

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Please sign in to access your dashboard.</p>
        <Link
          href="/sign-in"
          className="rounded-lg bg-[#102B25] px-5 py-3 font-semibold text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const user = session.user as { role?: string; name?: string; email?: string; image?: string | null; plan?: string } & {
    role?: string;
    name?: string;
    email?: string;
  };

  const role = user.role || "student";

  const links =
    dashboardLinks[role as keyof typeof dashboardLinks];

  if (!links) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-600">
          Your account role is not recognized. Please contact support.
        </p>
      </div>
    );
  }

  const roleTitle =
    role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <main className="min-h-screen bg-[#F5F7F3] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            {roleTitle} Dashboard
          </p>

          <h1 className="mt-3 text-3xl font-bold text-[#102B25] sm:text-4xl">
            Welcome back, {user.name || "User"}!
          </h1>

          <p className="mt-3 text-gray-500">
            Manage your MentorLagbe account and access your dashboard tools.
          </p>

          <p className="mt-2 text-sm text-gray-400">
            {user.email}
          </p>
        </div>

        <div className="mb-8 rounded-2xl bg-[#102B25] p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-[#D6F36A]">
                YOUR ACCOUNT
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {roleTitle} Account
              </h2>

              <p className="mt-2 text-sm text-gray-300">
                Your account is ready. Choose an option below to get started.
              </p>
            </div>

            <GraduationCap
              size={64}
              className="text-[#D6F36A]"
            />
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-xl font-bold text-[#102B25]">
            Quick Access
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Everything you need, in one place.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:border-green-700 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF1E8] text-[#102B25] transition group-hover:bg-[#102B25] group-hover:text-[#D6F36A]">
                  <Icon size={23} />
                </div>

                <h3 className="text-lg font-bold text-[#102B25]">
                  {item.title}
                </h3>

                <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                  {item.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-green-800">
                  Open
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
