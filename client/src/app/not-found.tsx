
import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#F5F7F3] px-5 text-center">
      <Compass className="text-[#527C69]" size={56} />
      <p className="mt-6 text-sm font-bold uppercase tracking-widest text-[#648C45]">404</p>
      <h1 className="mt-2 text-4xl font-extrabold text-[#102B25]">This page took a different route</h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-[#718078]">
        The page you are looking for does not exist or has been moved. Let us take you back home.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-xl bg-[#102B25] px-6 text-sm font-bold text-white transition hover:bg-[#1B4235]"
      >
        Back to Home
      </Link>
    </main>
  );
}
