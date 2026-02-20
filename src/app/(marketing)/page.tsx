import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { Platforms } from "@/components/marketing/platforms";
import { Pricing } from "@/components/marketing/pricing";

export default function LandingPage() {
  return (
    <div className="w-full">
      <Hero />
      <Features />
      <Platforms />
      <Pricing />
    </div>
  );
}
