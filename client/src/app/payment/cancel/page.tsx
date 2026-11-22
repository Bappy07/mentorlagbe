
import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#F5F7F3] px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-[#E5EBE2] bg-white p-10 text-center shadow-sm">
        <XCircle className="mx-auto text-[#B45309]" size={52} />
        <h1 className="mt-6 text-3xl font-extrabold text-[#102B25]">Payment submission cancelled</h1>
        <p className="mt-3 text-sm leading-7 text-[#718078]">
          No payment details were submitted. You can return to the bKash payment form whenever you are ready.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/payment"
            className="inline-flex h-12 items-center rounded-xl bg-[#102B25] px-6 text-sm font-bold text-white"
          >
            Back to Payment
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-12 items-center rounded-xl border border-[#DCE4DB] px-6 text-sm font-bold text-[#102B25]"
          >
            Back to Pricing
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-xl border border-[#DCE4DB] px-6 text-sm font-bold text-[#102B25]"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
