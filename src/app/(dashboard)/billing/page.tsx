"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Check, Crown, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PLAN_PRICES, PLAN_LIMITS } from "@/types/database";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/database";
import { useUserStore } from "@/store/user-store";

const statusConfig: Record<SubscriptionStatus, { color: string; label: string }> = {
  active: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "Active" },
  past_due: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", label: "Payment Due" },
  canceled: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Canceled" },
  trialing: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Trialing" },
};

const plans: Array<{ id: SubscriptionPlan; icon: React.ReactNode; features: string[] }> = [
  {
    id: "solo",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "1 brand profile",
      "Basic scheduling",
      "Essential analytics",
      "Email support",
    ],
  },
  {
    id: "starter",
    icon: <Crown className="h-6 w-6" />,
    features: [
      "5 brand profiles",
      "Advanced scheduling",
      "Full analytics suite",
      "Priority email support",
      "Custom branding",
    ],
  },
  {
    id: "advanced",
    icon: <CreditCard className="h-6 w-6" />,
    features: [
      "10 brand profiles",
      "Priority posting",
      "AI-powered insights",
      "24/7 phone support",
      "Custom integrations",
      "Dedicated account manager",
    ],
  },
];

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for successful checkout redirect
  useEffect(() => {
    const checkoutSuccess = searchParams.get("checkout");
    if (checkoutSuccess === "success") {
      setShowSuccess(true);
      // Refresh user data
      window.location.href = "/billing";
    }
  }, [searchParams]);

  const handleUpgradeDowngrade = async (plan: SubscriptionPlan) => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        setError(data.error || "Failed to initiate checkout");
        setLoading(false);
        return;
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleOpenPortal = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        setError(data.error || "Failed to open billing portal");
        setLoading(false);
        return;
      }

      // Redirect to Stripe customer portal
      window.location.href = data.url;
    } catch (err) {
      console.error("Portal error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const currentPlan = user?.subscription_plan || "solo";
  const currentStatus = user?.subscription_status || "active";
  const brandLimit = user?.brand_limit || 1;
  const statusInfo = statusConfig[currentStatus];

  return (
    <DashboardShell
      title="Billing & Plans"
      subtitle="Manage your subscription and upgrade to unlock more features"
    >
      <div className="space-y-8 p-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
            <p className="font-medium">Welcome! Your subscription has been activated.</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Current Plan Info */}
        {user && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-blue-900 dark:text-blue-100">
                    Current Plan
                  </CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300">
                    {PLAN_PRICES[currentPlan].label} Plan
                  </CardDescription>
                </div>
                <Badge className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Price</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ${PLAN_PRICES[currentPlan].monthly}
                    <span className="text-sm font-normal text-blue-700 dark:text-blue-300">/month</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Brand Limit</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {brandLimit}
                    <span className="text-sm font-normal text-blue-700 dark:text-blue-300"> brand{brandLimit !== 1 ? "s" : ""}</span>
                  </p>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleOpenPortal}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Manage Subscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Comparison */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Choose Your Plan</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all ${
                  currentPlan === plan.id
                    ? "ring-2 ring-blue-500 dark:ring-blue-400"
                    : ""
                }`}
              >
                {currentPlan === plan.id && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />
                )}

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {plan.icon}
                      </div>
                      <div>
                        <CardTitle>{PLAN_PRICES[plan.id].label}</CardTitle>
                        <CardDescription>
                          ${PLAN_PRICES[plan.id].monthly}/month
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price and Limit Info */}
                  <div className="space-y-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Brands</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {PLAN_LIMITS[plan.id]}
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleUpgradeDowngrade(plan.id)}
                    disabled={loading || currentPlan === plan.id}
                    className={
                      currentPlan === plan.id
                        ? "w-full bg-slate-200 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        : "w-full"
                    }
                  >
                    {currentPlan === plan.id ? (
                      "Current Plan"
                    ) : currentPlan === "solo" ||
                      (currentPlan === "starter" && plan.id === "advanced") ? (
                      <>
                        Upgrade <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Switch Plan"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                Can I change my plan anytime?
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                What payment methods do you accept?
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                We accept all major credit cards and can process payments securely through Stripe.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                Do you offer refunds?
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                We offer a 30-day money-back guarantee on all plans. Contact our support team for assistance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                What happens when I exceed the brand limit?
              </h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                You'll need to upgrade your plan to add more brands. You can manage your brands from the Brands section.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
