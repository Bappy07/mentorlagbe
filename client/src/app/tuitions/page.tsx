
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { tuitions } from "@/data/tuitions";
import TuitionCard from "@/components/tuition-card";
import TuitionFilters from "@/components/tuition-filters";

const ITEMS_PER_PAGE = 6;

type SortOption = "newest" | "low-to-high" | "high-to-low";

export default function TuitionsPage() {
  const [search, setSearch] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    selectedSubjects,
    selectedLocations,
    selectedTypes,
    minSalary,
    maxSalary,
    sortBy,
  ]);

  const filteredTuitions = tuitions.filter((tuition) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      tuition.title.toLowerCase().includes(searchTerm) ||
      tuition.classLevel.toLowerCase().includes(searchTerm) ||
      tuition.location.toLowerCase().includes(searchTerm) ||
      tuition.subjects.some((subject) =>
        subject.toLowerCase().includes(searchTerm)
      );

    const matchesSubject =
      selectedSubjects.length === 0 ||
      selectedSubjects.some((subject) =>
        tuition.subjects.includes(subject)
      );

    const matchesLocation =
      selectedLocations.length === 0 ||
      selectedLocations.some((location) =>
        tuition.location.toLowerCase().includes(location.toLowerCase())
      );

    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.includes(tuition.tuitionType);

    const matchesMinSalary =
      minSalary === "" || tuition.salary >= Number(minSalary);

    const matchesMaxSalary =
      maxSalary === "" || tuition.salary <= Number(maxSalary);

    return (
      matchesSearch &&
      matchesSubject &&
      matchesLocation &&
      matchesType &&
      matchesMinSalary &&
      matchesMaxSalary
    );
  });

  const sortedTuitions = [...filteredTuitions].sort((a, b) => {
    if (sortBy === "low-to-high") {
      return a.salary - b.salary;
    }

    if (sortBy === "high-to-low") {
      return b.salary - a.salary;
    }

    return (
      tuitions.findIndex((item) => item.id === a.id) -
      tuitions.findIndex((item) => item.id === b.id)
    );
  });

  const totalPages = Math.ceil(sortedTuitions.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentTuitions = sortedTuitions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  function resetFilters() {
    setSearch("");
    setSelectedSubjects([]);
    setSelectedLocations([]);
    setSelectedTypes([]);
    setMinSalary("");
    setMaxSalary("");
    setSortBy("newest");
  }

  return (
    <main className="min-h-screen bg-[#F5F7F3]">
      {/* Hero Section */}
      <section className="bg-[#102B25] px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-widest text-[#D6F36A]">
            Find your opportunity
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Explore Tuition Opportunities
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">
            Discover teaching opportunities that match your
            skills, experience, and preferred location.
          </p>

          <div className="mt-9 flex max-w-2xl items-center gap-3 rounded-2xl bg-white p-2">
            <Search className="ml-3 shrink-0 text-[#829187]" size={21} />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by subject, class or location..."
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

      {/* Tuition Listings */}
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
        <div className="mb-9">
          <p className="text-sm font-semibold text-[#648C45]">
            FIND YOUR NEXT MATCH
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-[#102B25] sm:text-3xl">
            Available Tuitions
          </h2>

          <p className="mt-2 text-sm text-[#829187]">
            Browse opportunities from students and families.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[260px_1fr]">
          {/* Filters */}
          <TuitionFilters
            selectedSubjects={selectedSubjects}
            selectedLocations={selectedLocations}
            selectedTypes={selectedTypes}
            minSalary={minSalary}
            maxSalary={maxSalary}
            onSubjectChange={(subject, checked) =>
              setSelectedSubjects((current) =>
                checked
                  ? [...current, subject]
                  : current.filter((item) => item !== subject)
              )
            }
            onLocationChange={(location, checked) =>
              setSelectedLocations((current) =>
                checked
                  ? [...current, location]
                  : current.filter((item) => item !== location)
              )
            }
            onTypeChange={(type, checked) =>
              setSelectedTypes((current) =>
                checked
                  ? [...current, type]
                  : current.filter((item) => item !== type)
              )
            }
            onMinSalaryChange={setMinSalary}
            onMaxSalaryChange={setMaxSalary}
            onReset={resetFilters}
          />

          {/* Results */}
          <div>
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#64736B]">
                <SlidersHorizontal size={17} />
                {filteredTuitions.length} opportunities found
              </div>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as SortOption)
                }
                className="rounded-xl border border-[#E1E9DE] bg-white px-4 py-3 text-sm font-semibold text-[#102B25] outline-none focus:border-[#527C69]"
              >
                <option value="newest">Sort: Newest first</option>
                <option value="low-to-high">Salary: Low to high</option>
                <option value="high-to-low">Salary: High to low</option>
              </select>
            </div>

            {currentTuitions.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {currentTuitions.map((tuition) => (
                    <TuitionCard key={tuition.id} tuition={tuition} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-[#829187]">
                    Showing {startIndex + 1}–
                    {Math.min(startIndex + ITEMS_PER_PAGE, sortedTuitions.length)}{" "}
                    of {sortedTuitions.length}
                  </p>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((page) => page - 1)
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E1E9DE] bg-white text-[#102B25] transition-colors hover:bg-[#EAF1E5] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-10 w-10 rounded-xl text-sm font-bold transition-colors ${
                            currentPage === page
                              ? "bg-[#102B25] text-white"
                              : "border border-[#E1E9DE] bg-white text-[#64736B] hover:bg-[#EAF1E5]"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((page) => page + 1)
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E1E9DE] bg-white text-[#102B25] transition-colors hover:bg-[#EAF1E5] disabled:cursor-not-allowed disabled:opacity-40"
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
                <Search
                  size={32}
                  className="mx-auto text-[#829187]"
                />

                <h3 className="mt-4 text-lg font-bold text-[#102B25]">
                  No tuitions found
                </h3>

                <p className="mt-2 text-sm text-[#829187]">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-xl bg-[#102B25] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1B4235]"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
