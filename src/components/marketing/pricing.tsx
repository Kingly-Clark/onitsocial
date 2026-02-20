"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLAN_PRICES, PLAN_LIMITS } from "@/types/database";
import { Check } from "lucide-react";

export function Pricing() {
  const plans = [
    {
      key: "solo" as const,
      price: PLAN_PRICES.solo.monthly,
      brands: PLAN_LIMITS.solo,
      features: [
        "1 brand account",
        "Post scheduling",
        "Basic analytics",
        "Unified inbox",
        "Email support",
      ],
    },
    {
      key: "starter" as const,
      price: PLAN_PRICES.starter.monthly,
      brands: PLAN_LIMITS.starter,
      features: [
        "5 brand accounts",
        "Advanced scheduling",
        "Detailed analytics",
        "Unified inbox",
        "Priority support",
        "Calendar view",
      ],
      highlighted: true,
    },
    {
      key: "advanced" as const,
      price: PLAN_PRICES.advanced.monthly,
      brands: PLAN_LIMITS.advanced,
      features: [
        "10 brand accounts",
        "Advanced scheduling",
        "Full analytics suite",
        "Unified inbox",
        "24/7 premium support",
        "Calendar view",
        "Team collaboration",
      ],
    },
  ];

  return (
    <section id="pricing" className="w-full py-20 sm:py-28 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, cancel
            anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-2xl transition-all duration-300 ${
                plan.highlighted
                  ? "md:scale-105 border-2 border-blue-600 shadow-2xl bg-white"
                  : "border border-slate-200 bg-white hover:shadow-lg"
              }`}
            >
              {/* Most Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan name and price */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 capitalize">
                    {plan.key}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      ${plan.price}
                    </span>
                    <span className="text-slate-600">/month</span>
                  </div>
                  <p className="text-slate-600 mt-3 text-sm">
                    Up to {plan.brands} brand
                    {plan.brands > 1 ? "s" : ""}
                  </p>
                </div>

                {/* CTA Button */}
                <Link href="/signup" className="w-full mb-8 block">
                  <Button
                    size="lg"
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </Link>

                {/* Features list */}
                <div className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ note */}
        <div className="mt-16 text-center">
          <p className="text-slate-600">
            Need more brands?{" "}
            <a href="mailto:support@onit.social" className="text-blue-600 hover:text-blue-700 font-semibold">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
