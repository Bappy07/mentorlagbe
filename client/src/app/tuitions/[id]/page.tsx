
import Link from "next/link";
import { notFound } from "next/navigation";
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
} from "lucide-react";
import { tuitions } from "@/data/tuitions";

type TuitionDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TuitionDetailsPage({
  params,
}: TuitionDetailsPageProps) {
  const { id } = await params;

  const tuition = tuitions.find((item) => item.id === id);

  if (!tuition) {
    notFound();
  }

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

        {/* Main Details */}
        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_320px]">
          <section className="rounded-3xl border border-[#E5EBE2] bg-white p-7 sm:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#EAF1E5] px-3 py-1.5 text-xs font-bold text-[#527C69]">
                {tuition.tuitionType} Tuition
              </span>

              <span className="text-xs font-medium text-[#829187]">
                Posted {tuition.postedAt}
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

            <p className="mt-3 text-sm leading-7 text-[#64736B]">
              A student is looking for a dedicated tutor for
              {` ${tuition.classLevel}`}. The ideal tutor should
              have good subject knowledge and the ability to
              explain concepts clearly.
            </p>

            <h2 className="mt-9 text-lg font-extrabold text-[#102B25]">
              Required Subjects
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {tuition.subjects.map((subject) => (
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
                Knowledge of {tuition.subjects.join(", ")}
              </div>

              <div className="flex items-center gap-3 text-sm text-[#64736B]">
                <CheckCircle2 size={18} className="text-[#648C45]" />
                Available {tuition.daysPerWeek} days per week
              </div>
            </div>
          </section>

          {/* Salary and Application Card */}
          <aside className="h-fit rounded-3xl border border-[#E5EBE2] bg-white p-7">
            <p className="text-sm font-semibold text-[#829187]">
              Monthly Salary
            </p>

            <p className="mt-2 text-4xl font-extrabold tracking-tight text-[#102B25]">
              ৳{tuition.salary.toLocaleString("en-BD")}
            </p>

            <p className="mt-1 text-xs text-[#829187]">
              Per month
            </p>

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
                  {tuition.tuitionType === "Online" ? (
                    <Monitor size={19} />
                  ) : (
                    <House size={19} />
                  )}
                </div>

                <div>
                  <p className="text-xs text-[#829187]">Tuition type</p>
                  <p className="text-sm font-bold text-[#102B25]">
                    {tuition.tuitionType}
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
                    {tuition.postedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F5E9] text-[#527C69]">
                  <Wallet size={19} />
                </div>

                <div>
                  <p className="text-xs text-[#829187]">Salary</p>
                  <p className="text-sm font-bold text-[#102B25]">
                    ৳{tuition.salary.toLocaleString("en-BD")}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/sign-in"
              className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-[#102B25] text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1B4235]"
            >
              Apply for This Tuition
            </Link>

            <p className="mt-4 text-center text-xs leading-5 text-[#829187]">
              Sign in to apply for this opportunity.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
