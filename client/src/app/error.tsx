
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#F5F7F3] px-5 text-center">
      <AlertTriangle className="text-[#B45309]" size={56} />
      <h1 className="mt-6 text-4xl font-extrabold text-[#102B25]">Something went wrong</h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-[#718078]">
        We could not load this page. Please try again or return to the home page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center rounded-xl bg-[#102B25] px-6 text-sm font-bold text-white"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-xl border border-[#DCE4DB] bg-white px-6 text-sm font-bold text-[#102B25]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
