
"use client";

import { SlidersHorizontal, RotateCcw } from "lucide-react";

type TuitionFiltersProps = {
  selectedSubjects: string[];
  selectedLocations: string[];
  selectedTypes: string[];
  minSalary: string;
  maxSalary: string;
  onSubjectChange: (subject: string, checked: boolean) => void;
  onLocationChange: (location: string, checked: boolean) => void;
  onTypeChange: (type: string, checked: boolean) => void;
  onMinSalaryChange: (value: string) => void;
  onMaxSalaryChange: (value: string) => void;
  onReset: () => void;
};

const subjects = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Science",
  "IELTS",
];

const locations = [
  "Uttara",
  "Dhanmondi",
  "Mirpur",
  "Bashundhara",
  "Farmgate",
];

export default function TuitionFilters({
  selectedSubjects,
  selectedLocations,
  selectedTypes,
  minSalary,
  maxSalary,
  onSubjectChange,
  onLocationChange,
  onTypeChange,
  onMinSalaryChange,
  onMaxSalaryChange,
  onReset,
}: TuitionFiltersProps) {
  return (
    <aside className="h-fit rounded-2xl border border-[#E5EBE2] bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={19} className="text-[#527C69]" />
          <h3 className="font-extrabold text-[#102B25]">
            Filters
          </h3>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-bold text-[#829187] transition-colors hover:text-[#102B25]"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>

      {/* Subject */}
      <div className="mt-7">
        <h4 className="text-sm font-bold text-[#102B25]">
          Subject
        </h4>

        <div className="mt-4 space-y-3">
          {subjects.map((subject) => (
            <label
              key={subject}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#64736B]"
            >
              <input
                type="checkbox"
                checked={selectedSubjects.includes(subject)}
                onChange={(event) =>
                  onSubjectChange(subject, event.target.checked)
                }
                className="h-4 w-4 accent-[#527C69]"
              />
              {subject}
            </label>
          ))}
        </div>
      </div>

      <div className="my-6 border-t border-[#E5EBE2]" />

      {/* Location */}
      <div>
        <h4 className="text-sm font-bold text-[#102B25]">
          Location
        </h4>

        <div className="mt-4 space-y-3">
          {locations.map((location) => (
            <label
              key={location}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#64736B]"
            >
              <input
                type="checkbox"
                checked={selectedLocations.includes(location)}
                onChange={(event) =>
                  onLocationChange(location, event.target.checked)
                }
                className="h-4 w-4 accent-[#527C69]"
              />
              {location}
            </label>
          ))}
        </div>
      </div>

      <div className="my-6 border-t border-[#E5EBE2]" />

      {/* Tuition Type */}
      <div>
        <h4 className="text-sm font-bold text-[#102B25]">
          Tuition Type
        </h4>

        <div className="mt-4 space-y-3">
          {["Home", "Online"].map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#64736B]"
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={(event) =>
                  onTypeChange(type, event.target.checked)
                }
                className="h-4 w-4 accent-[#527C69]"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <div className="my-6 border-t border-[#E5EBE2]" />

      {/* Salary */}
      <div>
        <h4 className="text-sm font-bold text-[#102B25]">
          Monthly Salary
        </h4>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <input
            type="number"
            min="0"
            placeholder="Min ৳"
            value={minSalary}
            onChange={(event) => onMinSalaryChange(event.target.value)}
            className="w-full min-w-0 rounded-lg border border-[#E1E9DE] px-3 py-2.5 text-sm text-[#102B25] outline-none focus:border-[#527C69]"
          />

          <input
            type="number"
            min="0"
            placeholder="Max ৳"
            value={maxSalary}
            onChange={(event) => onMaxSalaryChange(event.target.value)}
            className="w-full min-w-0 rounded-lg border border-[#E1E9DE] px-3 py-2.5 text-sm text-[#102B25] outline-none focus:border-[#527C69]"
          />
        </div>
      </div>
    </aside>
  );
}
