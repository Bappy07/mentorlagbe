
"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import TuitionCard from "@/components/tuition-card";
import type { Tuition } from "@/data/tuitions";
import { apiFetch } from "@/lib/api";

const ITEMS_PER_PAGE = 6;

type ApiTuition = {
  _id: string;
  title: string;
  description: string;
  classLevel: string;
  subjects: string[];
  subject?: string;
  location: string;
  monthlyFee?: number;
  salary?: number;
  mode?: string;
  tuitionType?: string;
  daysPerWeek: number;
  createdAt: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  tuitions: ApiTuition[];
  total: number;
  totalPages: number;
};

function formatPostedAt(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recently";

  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

export default function TuitionsPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [mode, setMode] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Read search params coming from the home page / subject links.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("subject") || params.get("q") || "");
    setSubject(params.get("subject") || "");
    setClassLevel(params.get("classLevel") || "");
    setMode(params.get("mode") || "");
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, subject, classLevel, mode]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTuitions() {
      try {
        setIsLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(ITEMS_PER_PAGE),
        });
        if (debouncedSearch) params.set("q", debouncedSearch);
        if (subject) params.set("subject", subject);
        if (classLevel) params.set("classLevel", classLevel);
        if (mode) params.set("mode", mode);

        const data = await apiFetch<ApiResponse>(
          `/tuitions/approved?${params.toString()}`
        );

        if (!data.success) throw new Error(data.message || "Failed to load tuitions.");

        const formatted: Tuition[] = (data.tuitions || []).map((tuition) => ({
          id: tuition._id,
          title: tuition.title,
          classLevel: tuition.classLevel,
          subjects: tuition.subjects?.length
            ? tuition.subjects
            : [tuition.subject || "General"],
          location: tuition.location,
          salary: tuition.monthlyFee ?? tuition.salary ?? 0,
          tuitionType: (tuition.mode || tuition.tuitionType) === "online" ? "Online" : "Home",
          daysPerWeek: tuition.daysPerWeek,
          postedAt: formatPostedAt(tuition.createdAt),
        }));

        if (sortBy === "low-to-high") formatted.sort((a, b) => a.salary - b.salary);
        if (sortBy === "high-to-low") formatted.sort((a, b) => b.salary - a.salary);

        setTuitions(formatted);
        setTotal(data.total ?? formatted.length);
        setTotalPages(data.totalPages ?? 1);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to load tuitions.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    fetchTuitions();
    return () => controller.abort();
  }, [debouncedSearch, subject, classLevel, mode, currentPage, sortBy]);

  function resetFilters() {
    setSearch("");
    setSubject("");
    setClassLevel("");
    setMode("");
    setSortBy("newest");
    setCurrentPage(1);
  }

  return (
    <main className="min-h-screen bg-[#F5F7F3]">
      <section className="bg-[#102B25] px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-widest text-[#D6F36A]">
            Find your opportunity
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Explore Tuition Opportunities
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">
            Search approved, active tuitions by subject, class level and mode.
          </p>

          <div className="mt-9 flex max-w-2xl items-center gap-3 rounded-2xl bg-white p-2">
            <Search className="ml-3 shrink-0 text-[#829187]" size={21} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or subject..."
              className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[#102B25] outline-none placeholder:text-[#9AA69D]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="px-3 py-2 text-sm font-semibold text-[#527C69] hover:text-[#102B25]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
        <div className="mb-9">
          <p className="text-sm font-semibold text-[#648C45]">FIND YOUR NEXT MATCH</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#102B25] sm:text-3xl">
            Available Tuitions
          </h2>
          <p className="mt-2 text-sm text-[#829187]">
            Results are filtered on the server for fast, accurate browsing.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border border-[#E1E9DE] bg-white p-6">
            <div className="flex items-center gap-2 text-[#102B25]">
              <SlidersHorizontal size={18} />
              <h3 className="text-sm font-extrabold">Filters</h3>
            </div>

            <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-[#849188]">
              Subject
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#E1E9DE] bg-white px-3 py-3 text-sm font-semibold text-[#102B25] outline-none"
              >
                <option value="">All subjects</option>
                {["Math", "Physics", "Chemistry", "Biology", "English", "IELTS", "Programming"].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-[#849188]">
              Class level
              <select
                value={classLevel}
                onChange={(event) => setClassLevel(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#E1E9DE] bg-white px-3 py-3 text-sm font-semibold text-[#102B25] outline-none"
              >
                <option value="">All levels</option>
                {["Class 5", "Class 7", "Class 9", "SSC", "HSC", "Class 11", "University"].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-[#849188]">
              Mode
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#E1E9DE] bg-white px-3 py-3 text-sm font-semibold text-[#102B25] outline-none"
              >
                <option value="">Any mode</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </label>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-7 w-full rounded-xl border border-[#DCE4DB] px-4 py-3 text-sm font-bold text-[#527C69] transition hover:bg-[#EAF1E5]"
            >
              Reset filters
            </button>
          </aside>

          <div>
            {isLoading ? (
              <div className="rounded-2xl border border-[#E1E9DE] bg-white px-6 py-20 text-center">
                <span className="loading loading-spinner loading-lg text-[#527C69]" />
                <p className="mt-4 text-sm font-medium text-[#829187]">Loading available tuitions...</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-white px-6 py-16 text-center">
                <h3 className="text-lg font-bold text-[#102B25]">Unable to load tuitions</h3>
                <p className="mt-2 text-sm text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-5 rounded-xl bg-[#102B25] px-5 py-3 text-sm font-bold text-white"
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <p className="text-sm font-semibold text-[#64736B]">
                    <SlidersHorizontal size={17} className="mr-2 inline" />
                    {total} opportunities found
                  </p>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="rounded-xl border border-[#E1E9DE] bg-white px-4 py-3 text-sm font-semibold text-[#102B25] outline-none"
                  >
                    <option value="newest">Sort: Newest first</option>
                    <option value="low-to-high">Fee: Low to high</option>
                    <option value="high-to-low">Fee: High to low</option>
                  </select>
                </div>

                {tuitions.length > 0 ? (
                  <>
                    <div className="grid gap-6 md:grid-cols-2">
                      {tuitions.map((tuition) => (
                        <TuitionCard key={tuition.id} tuition={tuition} />
                      ))}
                    </div>

                    <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-sm text-[#829187]">
                        Page {currentPage} of {totalPages}
                      </p>
                      {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E1E9DE] bg-white text-[#102B25] disabled:opacity-40"
                            aria-label="Previous page"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                            <button
                              key={page}
                              type="button"
                              onClick={() => setCurrentPage(page)}
                              className={`h-10 w-10 rounded-xl text-sm font-bold ${
                                currentPage === page
                                  ? "bg-[#102B25] text-white"
                                  : "border border-[#E1E9DE] bg-white text-[#64736B]"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((page) => page + 1)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E1E9DE] bg-white text-[#102B25] disabled:opacity-40"
                            aria-label="Next page"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#DCE5D8] bg-white px-6 py-16 text-center">
                    <Search size={32} className="mx-auto text-[#829187]" />
                    <h3 className="mt-4 text-lg font-bold text-[#102B25]">No tuitions found</h3>
                    <p className="mt-2 text-sm text-[#829187]">Try changing your search or filters.</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-5 rounded-xl bg-[#102B25] px-5 py-3 text-sm font-bold text-white"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
