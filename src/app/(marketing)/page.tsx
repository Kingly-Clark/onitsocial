import { Hero } from "@/components/marketing/hero";
import { AgentShowcase } from "@/components/marketing/agent-showcase";
import { ValueStatements } from "@/components/marketing/value-statements";
import { Features } from "@/components/marketing/features";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";

export default function LandingPage() {
  return (
    <div className="w-full">
      <Hero />
      <AgentShowcase />
      <ValueStatements />
      <Features />
      <Faq />
      <FinalCta />
    </div>
  );
}
