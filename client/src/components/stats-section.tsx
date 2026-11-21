
import {
  BookOpen,
  GraduationCap,
  Handshake,
  Users,
} from "lucide-react";

const stats = [
  {
    label: "Active Tutors",
    value: "1,200+",
    description: "Dedicated educators",
    icon: GraduationCap,
  },
  {
    label: "Available Tuitions",
    value: "850+",
    description: "Learning opportunities",
    icon: BookOpen,
  },
  {
    label: "Successful Connections",
    value: "2,500+",
    description: "Students and tutors connected",
    icon: Handshake,
  },
  {
    label: "Subjects Covered",
    value: "25+",
    description: "Across different study levels",
    icon: Users,
  },
];

export default function StatsSection() {
  return (
    <section className="bg-[#102B25] px-5 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#D6F36A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D6F36A]" />
            Our growing community
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Making learning more accessible
          </h2>

          <p className="mt-4 text-base leading-7 text-white/60">
            Bringing students and passionate tutors together to create
            better learning opportunities.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#D6F36A]/40 hover:bg-white/[0.08]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D6F36A] text-[#102B25]">
                  <Icon size={23} />
                </div>

                <p className="mt-7 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {stat.value}
                </p>

                <h3 className="mt-2 text-sm font-bold text-[#D6F36A]">
                  {stat.label}
                </h3>

                <p className="mt-2 text-xs leading-5 text-white/50">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-white/40">
          Illustrative figures for the platform preview.
        </p>
      </div>
    </section>
  );
}
