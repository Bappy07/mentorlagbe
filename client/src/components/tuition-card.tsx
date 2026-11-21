
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Wallet,
} from "lucide-react";
import type { Tuition } from "@/data/tuitions";

type TuitionCardProps = {
  tuition: Tuition;
};

export default function TuitionCard({ tuition }: TuitionCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-[#E3EAE0] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#B9CCAE] hover:shadow-[0_15px_40px_rgba(16,43,37,0.08)]">
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-lg bg-[#F0F5E9] px-3 py-1.5 text-xs font-bold text-[#527C69]">
          {tuition.classLevel}
        </span>

        <span className="rounded-full bg-[#F5F7F3] px-3 py-1.5 text-xs font-semibold text-[#64736B]">
          {tuition.tuitionType} Tuition
        </span>
      </div>

      {/* Title and Subjects */}
      <div className="mt-5">
        <h3 className="text-lg font-bold leading-snug text-[#102B25] transition-colors group-hover:text-[#527C69]">
          {tuition.title}
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {tuition.subjects.map((subject) => (
            <span
              key={subject}
              className="rounded-md border border-[#E5EBE4] px-2.5 py-1 text-xs font-medium text-[#64736B]"
            >
              {subject}
            </span>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 space-y-3 border-t border-[#EDF1EB] pt-5">
        <div className="flex items-center gap-3 text-sm text-[#64736B]">
          <MapPin size={17} className="shrink-0 text-[#829187]" />
          <span>{tuition.location}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#64736B]">
          <CalendarDays size={17} className="shrink-0 text-[#829187]" />
          <span>{tuition.daysPerWeek} days per week</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#64736B]">
          <Wallet size={17} className="shrink-0 text-[#829187]" />
          <span>
            Monthly salary:{" "}
            <strong className="font-bold text-[#102B25]">
              ৳{tuition.salary.toLocaleString("en-BD")}
            </strong>
          </span>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#EDF1EB] pt-5 mt-6">
        <span className="text-xs font-medium text-[#829187]">
          {tuition.postedAt}
        </span>

        <Link
          href={`/tuitions/${tuition.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#102B25] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#1B4235]"
        >
          View Details
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}
