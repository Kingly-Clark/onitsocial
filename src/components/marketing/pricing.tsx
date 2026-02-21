"use client";

import { Pricing2 } from "@/components/ui/pricing2";

const pricingData = {
  heading: "Simple, Transparent Pricing",
  description:
    "Choose the plan that fits your needs. No hidden fees, cancel anytime.",
  plans: [
    {
      id: "solo",
      name: "Solo",
      description: "For solo creators and freelancers",
      monthlyPrice: "$5",
      yearlyPrice: "$4",
      features: [
        { text: "1 brand account" },
        { text: "Post scheduling" },
        { text: "Basic analytics" },
        { text: "Unified inbox" },
        { text: "Email support" },
      ],
      button: {
        text: "Get Started",
        url: "/signup",
      },
    },
    {
      id: "starter",
      name: "Starter",
      description: "For growing businesses",
      monthlyPrice: "$10",
      yearlyPrice: "$8",
      features: [
        { text: "5 brand accounts" },
        { text: "Advanced scheduling" },
        { text: "Detailed analytics" },
        { text: "Priority support" },
        { text: "Calendar view" },
      ],
      button: {
        text: "Get Started",
        url: "/signup",
      },
    },
    {
      id: "advanced",
      name: "Advanced",
      description: "For agencies and teams",
      monthlyPrice: "$20",
      yearlyPrice: "$16",
      features: [
        { text: "10 brand accounts" },
        { text: "Full analytics suite" },
        { text: "24/7 premium support" },
        { text: "Team collaboration" },
        { text: "Custom reports" },
      ],
      button: {
        text: "Get Started",
        url: "/signup",
      },
    },
  ],
};

export function Pricing() {
  return (
    <div id="pricing">
      <Pricing2 {...pricingData} />
    </div>
  );
}
