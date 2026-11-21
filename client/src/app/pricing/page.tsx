
import type { Metadata } from "next";
import PricingSection from "@/components/pricing-section";

export const metadata: Metadata = {
  title: "Pricing | MentorLagbe",
  description:
    "Explore MentorLagbe Student Pro and Tutor Pro membership plans.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#F5F7F3]">
      <PricingSection />
    </main>
  );
}
