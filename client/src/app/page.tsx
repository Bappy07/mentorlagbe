
import Link from "next/link";
import {
  ArrowRight,
  Atom,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  CheckCircle2,
  Dna,
  FlaskConical,
  GraduationCap,
  Languages,
  Monitor,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { tuitions as fallbackTuitions, type Tuition } from "@/data/tuitions";
import { API_URL } from "@/lib/config";
import TuitionCard from "@/components/tuition-card";
import PricingSection from "@/components/pricing-section";
import StatsSection from "@/components/stats-section";
import TestimonialsSection from "@/components/testimonials-section";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Verified Tutors",
    description: "Learn from trusted educators",
  },
  {
    icon: Users,
    title: "Personalized Learning",
    description: "Find the right match for you",
  },
  {
    icon: BookOpen,
    title: "Easy Applications",
    description: "Connect without the hassle",
  },
];

const subjects = [
  { name: "Mathematics", icon: Calculator, description: "Build problem-solving skills" },
  { name: "Physics", icon: Atom, description: "Understand how the world works" },
  { name: "Chemistry", icon: FlaskConical, description: "Explore science and reactions" },
  { name: "Biology", icon: Dna, description: "Discover the science of life" },
  { name: "English", icon: Languages, description: "Improve language and communication" },
  { name: "ICT", icon: Monitor, description: "Learn technology and computing" },
  { name: "Accounting", icon: BriefcaseBusiness, description: "Master financial concepts" },
  { name: "All Subjects", icon: BookOpen, description: "Explore every learning opportunity" },
];

type FeaturedApiTuition = {
  _id: string;
  title: string;
  classLevel: string;
  subjects?: string[];
  subject?: string;
  location: string;
  monthlyFee?: number;
  salary?: number;
  mode?: string;
  tuitionType?: string;
  daysPerWeek: number;
  createdAt?: string;
};

/** Fetch the 6 newest approved tuitions; fall back to seed data if the API is offline. */
async function getFeaturedTuitions(): Promise<Tuition[]> {
  try {
    const response = await fetch(
      `${API_URL}/tuitions/approved?limit=6&page=1`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) return fallbackTuitions.slice(0, 6);

    const body = (await response.json()) as {
      success?: boolean;
      tuitions?: FeaturedApiTuition[];
    };
    if (!body.success || !body.tuitions?.length) {
      return fallbackTuitions.slice(0, 6);
    }

    return body.tuitions.slice(0, 6).map((tuition) => ({
      id: tuition._id,
      title: tuition.title,
      classLevel: tuition.classLevel,
      subjects: tuition.subjects?.length
        ? tuition.subjects
        : [tuition.subject || "General"],
      location: tuition.location,
      salary: tuition.monthlyFee ?? tuition.salary ?? 0,
      tuitionType:
        (tuition.mode || tuition.tuitionType) === "online" ? "Online" : "Home",
      daysPerWeek: tuition.daysPerWeek,
      postedAt: tuition.createdAt
        ? new Date(tuition.createdAt).toLocaleDateString()
        : "Recently",
    }));
  } catch {
    return fallbackTuitions.slice(0, 6);
  }
}

export default async function Home() {
  const featuredTuitions = await getFeaturedTuitions();

  return (
    <main className="flex-1 overflow-hidden bg-[#F5F7F3]">
      {/* Hero Section */}
      <section className="relative px-5 pb-20 pt-16 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#DCE7D8] bg-white px-4 py-2 text-sm font-semibold text-[#42634F] shadow-sm">
              <Sparkles size={16} className="text-[#88A83D]" />
              Your journey to better learning starts here
            </div>

            <h1 className="max-w-2xl text-4xl leading-[1.15] font-extrabold tracking-tight text-[#102B25] sm:text-5xl lg:text-6xl">
              The right tutor can
              <span className="relative mx-2 inline-block">
                change
                <span className="absolute -bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-[#D6F36A]" />
              </span>
              everything.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-[#64736B] sm:text-lg">
              Find the perfect tutor, explore tuition opportunities, and
              take the next step toward your academic goals with MentorLagbe.
            </p>

            {/* Search */}
            <form
              action="/tuitions"
              method="GET"
              className="mt-9 flex max-w-xl flex-col gap-3 rounded-2xl border border-[#E1E8DE] bg-white p-3 shadow-[0_12px_40px_rgba(16,43,37,0.07)] sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 items-center gap-3 px-3">
                <Search size={21} className="shrink-0 text-[#829187]" />
                <input
                  type="text"
                  name="subject"
                  placeholder="What subject do you need help with?"
                  className="h-12 w-full min-w-0 bg-transparent text-sm text-[#102B25] outline-none placeholder:text-[#9AA69D]"
                />
              </div>

              <button
                type="submit"
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#102B25] px-6 text-sm font-bold text-white transition-colors hover:bg-[#1B4235]"
              >
                Find a Tutor
                <ArrowRight size={17} />
              </button>
            </form>

            {/* CTA Buttons */}
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Link
                href="/tuitions"
                className="inline-flex items-center gap-2 rounded-xl bg-[#D6F36A] px-6 py-3.5 text-sm font-bold text-[#102B25] transition-all hover:-translate-y-0.5 hover:bg-[#C7E65B]"
              >
                Explore Tuitions
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-[#102B25] transition-colors hover:bg-white"
              >
                Become a Tutor
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#64736B]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#648C45]" />
                Simple registration
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#648C45]" />
                Easy applications
              </span>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#D6F36A]/40 blur-3xl" />
            <div className="absolute -bottom-10 -left-8 h-48 w-48 rounded-full bg-[#B8D7C0]/50 blur-3xl" />

            <div className="relative rounded-[2rem] border border-[#E0E8DD] bg-white p-4 shadow-[0_25px_80px_rgba(16,43,37,0.12)] sm:p-6">
              <div className="flex items-center justify-between border-b border-[#EDF1EB] pb-5">
                <div>
                  <p className="text-sm font-semibold text-[#829187]">
                    YOUR LEARNING JOURNEY
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold text-[#102B25]">
                    Find your match
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0F5E9] text-[#42634F]">
                  <GraduationCap size={24} />
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-[#F5F7F3] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#527C69] shadow-sm">
                    <Search size={19} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#829187]">
                      SEARCHING FOR
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-[#102B25]">
                      Your perfect tutor
                    </p>
                  </div>
                  <div className="ml-auto rounded-full bg-[#D6F36A] px-3 py-1 text-xs font-bold text-[#102B25]">
                    Explore
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold text-[#102B25]">
                    A better way to learn
                  </h3>
                  <span className="text-xs font-semibold text-[#829187]">
                    MentorLagbe
                  </span>
                </div>

                <div className="rounded-2xl border border-[#E6ECE3] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E5EDDF] text-lg font-extrabold text-[#42634F]">
                      ML
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-[#102B25]">
                          Quality tutoring
                        </p>
                        <span className="flex items-center gap-1 rounded-full bg-[#F0F6E7] px-2 py-1 text-[10px] font-bold text-[#55783C]">
                          <CheckCircle2 size={12} />
                          Trusted platform
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#829187]">
                        The right support for your goals
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#F5F7F3] p-3">
                      <div className="flex items-center gap-2 text-[#648C45]">
                        <Users size={17} />
                        <span className="text-xs font-semibold">Students</span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-[#102B25]">
                        Find a tutor
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#F5F7F3] p-3">
                      <div className="flex items-center gap-2 text-[#648C45]">
                        <GraduationCap size={17} />
                        <span className="text-xs font-semibold">Tutors</span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-[#102B25]">
                        Find tuition
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-[#102B25] px-4 py-4 text-white">
                <div>
                  <p className="text-sm font-bold">
                    Your goals. Your tutor.
                  </p>
                  <p className="mt-1 text-xs text-white/65">
                    Make learning count.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D6F36A] text-[#102B25]">
                  <Sparkles size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Strip */}
      <section className="border-y border-[#E4EAE1] bg-white px-5 py-8 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-7 sm:grid-cols-3 sm:gap-5">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="flex items-center gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0F5E9] text-[#527C69]">
                  <Icon size={22} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#102B25]">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#829187]">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Latest Tuition Opportunities */}
      <section
        id="latest-tuitions"
        className="px-5 py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF1E5] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#527C69]">
                <Sparkles size={14} />
                Fresh Opportunities
              </span>

              <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#102B25] sm:text-4xl">
                Latest tuition opportunities
              </h2>

              <p className="mt-4 text-base leading-7 text-[#64736B]">
                Explore the latest tuition posts and find an opportunity
                that matches your skills, interests, and schedule.
              </p>
            </div>

            <Link
              href="/tuitions"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[#DCE4DB] bg-white px-5 py-3 text-sm font-bold text-[#102B25] transition-all hover:border-[#102B25] hover:bg-[#102B25] hover:text-white"
            >
              Browse All Tuitions
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTuitions.map((tuition) => (
              <TuitionCard key={tuition.id} tuition={tuition} />
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl bg-[#102B25] px-6 py-10 text-center sm:px-10">
            <h3 className="text-2xl font-extrabold text-white">
              Ready to find your next opportunity?
            </h3>

            <p className="mt-3 max-w-lg text-sm leading-6 text-white/65">
              Join MentorLagbe and connect with students or tutors who
              share your learning goals.
            </p>

            <Link
              href="/sign-up"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D6F36A] px-6 py-3.5 text-sm font-bold text-[#102B25] transition-all hover:-translate-y-0.5 hover:bg-[#C7E65B]"
            >
              Get Started
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="bg-white px-5 py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF1E5] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#527C69]">
              Simple process
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#102B25] sm:text-4xl">
              Get started in three easy steps
            </h2>

            <p className="mt-4 text-base leading-7 text-[#64736B]">
              Whether you are looking for a tutor or searching for your next
              teaching opportunity, MentorLagbe makes the process simple.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <article className="relative rounded-2xl border border-[#E3EAE0] bg-[#F5F7F3] p-7">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D6F36A] text-[#102B25]">
                  <Search size={25} />
                </div>
                <span className="text-3xl font-extrabold text-[#DCE6D8]">
                  01
                </span>
              </div>

              <h3 className="mt-7 text-xl font-extrabold text-[#102B25]">
                Find the Right Match
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#64736B]">
                Students can browse tuition opportunities and explore tutors
                based on their subject, location, and learning needs.
              </p>
            </article>

            <article className="relative rounded-2xl border border-[#E3EAE0] bg-[#F5F7F3] p-7">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D6F36A] text-[#102B25]">
                  <Users size={25} />
                </div>
                <span className="text-3xl font-extrabold text-[#DCE6D8]">
                  02
                </span>
              </div>

              <h3 className="mt-7 text-xl font-extrabold text-[#102B25]">
                Connect and Apply
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#64736B]">
                Students can apply to suitable tutors or tuition posts, while
                tutors can submit applications for opportunities that fit them.
              </p>
            </article>

            <article className="relative rounded-2xl border border-[#E3EAE0] bg-[#F5F7F3] p-7">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D6F36A] text-[#102B25]">
                  <GraduationCap size={25} />
                </div>
                <span className="text-3xl font-extrabold text-[#DCE6D8]">
                  03
                </span>
              </div>

              <h3 className="mt-7 text-xl font-extrabold text-[#102B25]">
                Start Your Journey
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#64736B]">
                Find the right connection, agree on the details, and take the
                next step toward better teaching and learning.
              </p>
            </article>
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/tuitions"
              className="inline-flex items-center gap-2 rounded-xl bg-[#102B25] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#1B4235]"
            >
              Explore Opportunities
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Subjects */}
      <section
        id="subjects"
        className="px-5 py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF1E5] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#527C69]">
                <BookOpen size={14} />
                Explore by subject
              </span>

              <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#102B25] sm:text-4xl">
                Find tuition by your favorite subject
              </h2>

              <p className="mt-4 text-base leading-7 text-[#64736B]">
                From mathematics to science and languages, discover learning
                opportunities across a wide range of subjects.
              </p>
            </div>

            <Link
              href="/tuitions"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[#DCE4DB] bg-white px-5 py-3 text-sm font-bold text-[#102B25] transition-all hover:border-[#102B25] hover:bg-[#102B25] hover:text-white"
            >
              View All Subjects
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject) => {
              const Icon = subject.icon;

              return (
                <Link
                  key={subject.name}
                  href={
                    subject.name === "All Subjects"
                      ? "/tuitions"
                      : `/tuitions?subject=${encodeURIComponent(subject.name)}`
                  }
                  className="group flex items-center gap-4 rounded-2xl border border-[#E3EAE0] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#B9CCAE] hover:shadow-[0_15px_40px_rgba(16,43,37,0.07)]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F0F5E9] text-[#527C69] transition-colors group-hover:bg-[#D6F36A] group-hover:text-[#102B25]">
                    <Icon size={23} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#102B25]">
                      {subject.name}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#829187]">
                      {subject.description}
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    className="shrink-0 text-[#A2B0A4] transition-all group-hover:translate-x-1 group-hover:text-[#102B25]"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <PricingSection />
      <StatsSection />
      <TestimonialsSection />
    </main>
  );
}
