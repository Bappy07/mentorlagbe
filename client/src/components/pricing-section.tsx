
"use client";

import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

const plans = [
  {
    name: "Student Pro",
    description: "For students who want more learning opportunities.",
    price: 1000,
    audience: "STUDENT",
    features: [
      "Access to tuition opportunities",
      "Apply to suitable tutors",
      "Manage your applications",
      "Priority support",
      "Pro membership badge",
    ],
  },
  {
    name: "Tutor Pro",
    description: "For tutors who want to grow their teaching career.",
    price: 1500,
    audience: "TUTOR",
    features: [
      "Create and manage your profile",
      "Explore tuition opportunities",
      "Manage student applications",
      "Enhanced profile visibility",
      "Pro membership badge",
    ],
  },
];

export default function PricingSection() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  function handleCheckout() {
    if (!session?.user) {
      toast.error("Please sign in before upgrading your plan.");
      router.push("/sign-in");
      return;
    }

    router.push("/payment");
  }

  return (
    <section
      id="pricing"
      className="bg-white px-5 py-20 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF1E5] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#527C69]">
            <Sparkles size={14} />
            Simple and transparent pricing
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#102B25] sm:text-4xl">
            Invest in your next opportunity
          </h2>

          <p className="mt-4 text-base leading-7 text-[#64736B]">
            Choose the membership that matches your goals.
            Start with free access and upgrade whenever you are ready.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-7 md:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-7 sm:p-9 ${
                plan.audience === "TUTOR"
                  ? "border-[#102B25] bg-[#102B25] text-white shadow-[0_20px_60px_rgba(16,43,37,0.15)]"
                  : "border-[#E1E9DE] bg-[#F5F7F3] text-[#102B25]"
              }`}
            >
              {plan.audience === "TUTOR" && (
                <span className="absolute -top-3 right-7 rounded-full bg-[#D6F36A] px-4 py-1.5 text-xs font-extrabold text-[#102B25]">
                  POPULAR
                </span>
              )}

              <div>
                <p
                  className={`text-xs font-bold tracking-[0.15em] ${
                    plan.audience === "TUTOR"
                      ? "text-[#D6F36A]"
                      : "text-[#648C45]"
                  }`}
                >
                  {plan.audience} MEMBERSHIP
                </p>

                <h3 className="mt-3 text-2xl font-extrabold">
                  {plan.name}
                </h3>

                <p
                  className={`mt-3 text-sm leading-6 ${
                    plan.audience === "TUTOR"
                      ? "text-white/65"
                      : "text-[#64736B]"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-extrabold tracking-tight">
                  ৳{plan.price}
                </span>
                <span
                  className={`pb-2 text-sm ${
                    plan.audience === "TUTOR"
                      ? "text-white/60"
                      : "text-[#829187]"
                  }`}
                >
                  / month
                </span>
              </div>

              <div
                className={`my-8 border-t ${
                  plan.audience === "TUTOR"
                    ? "border-white/15"
                    : "border-[#DCE5D8]"
                }`}
              />

              <p className="text-sm font-bold">What's included</p>

              <ul className="mt-5 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        plan.audience === "TUTOR"
                          ? "bg-[#D6F36A] text-[#102B25]"
                          : "bg-[#E2EDD9] text-[#527C69]"
                      }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>

                    <span
                      className={
                        plan.audience === "TUTOR"
                          ? "text-white/80"
                          : "text-[#52635A]"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={handleCheckout}
                className={`mt-10 flex h-12 items-center justify-center rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 ${
                  plan.audience === "TUTOR"
                    ? "bg-[#D6F36A] text-[#102B25] hover:bg-[#C7E65B]"
                    : "bg-[#102B25] text-white hover:bg-[#1B4235]"
                }`}
              >
                {session?.user ? "Continue to bKash" : "Get Started"}
              </button>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs leading-6 text-[#829187]">
          All prices are monthly. Pro payments are submitted through bKash and
          activated after admin verification.
        </p>
      </div>
    </section>
  );
}
