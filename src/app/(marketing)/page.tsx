import { Hero } from "@/components/marketing/hero";
import { AgentShowcase } from "@/components/marketing/agent-showcase";
import { Features } from "@/components/marketing/features";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";

export default function LandingPage() {
  return (
    <div className="w-full">
      <Hero />
      <AgentShowcase />
      <Features />
      <Pricing />
      <Faq />
      <FinalCta />
    </div>
  );
}
