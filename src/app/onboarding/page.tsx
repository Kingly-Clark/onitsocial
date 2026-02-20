"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectPlatform } from "@/components/brands/connect-platform";
import { PLAN_PRICES, PLAN_LIMITS } from "@/types/database";
import type { SubscriptionPlan, ConnectedAccount } from "@/types/database";

const BRAND_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [brandId, setBrandId] = useState("");
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);

  const [formData, setFormData] = useState({
    brandName: "",
    brandColor: BRAND_COLORS[0],
    selectedPlan: "starter" as SubscriptionPlan,
  });

  // Step 1: Create brand
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.brandName,
          color: formData.brandColor,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create brand");
      }

      const data = await response.json();
      setBrandId(data.data.id);
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Select plan and complete
  const handleCompletePlan = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: formData.selectedPlan,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update subscription");
      }

      setCurrentStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Redirect to dashboard
  useEffect(() => {
    if (currentStep === 4) {
      const timeout = setTimeout(() => {
        router.push("/brands");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentStep, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step < currentStep
                      ? "bg-green-500 text-white"
                      : step === currentStep
                        ? "bg-brand-500 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {step < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                      step < currentStep
                        ? "bg-green-500"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            Step {currentStep} of 4
          </p>
        </div>

        {/* Step 1: Create Brand */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Create Your First Brand</CardTitle>
              <CardDescription>
                Let's start by setting up your brand name and color
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBrand} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    Brand Name
                  </label>
                  <Input
                    placeholder="e.g., My Company, Personal Brand"
                    value={formData.brandName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        brandName: e.target.value,
                      }))
                    }
                    disabled={loading}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    Brand Color
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {BRAND_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            brandColor: color,
                          }))
                        }
                        disabled={loading}
                        className={`h-12 rounded-lg border-2 transition-all ${
                          formData.brandColor === color
                            ? "border-slate-900 dark:border-slate-50"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !formData.brandName.trim()}
                  className="w-full gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Connect Platforms */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Platforms</CardTitle>
              <CardDescription>
                Connect your social media and business accounts (optional - you can skip this)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ConnectPlatform
                brandId={brandId}
                connectedAccounts={connectedAccounts}
                onConnect={async () => {
                  // Refresh connected accounts
                  const response = await fetch(`/api/brands/${brandId}`);
                  if (response.ok) {
                    const data = await response.json();
                    setConnectedAccounts(data.data.connected_accounts || []);
                  }
                }}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 gap-2"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Choose Plan */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Plan</CardTitle>
              <CardDescription>
                Select the plan that works best for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                {Object.entries(PLAN_PRICES).map(([plan, pricing]) => (
                  <button
                    key={plan}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        selectedPlan: plan as SubscriptionPlan,
                      }))
                    }
                    disabled={loading}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      formData.selectedPlan === plan
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                        : "border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700"
                    }`}
                  >
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50 capitalize">
                      {pricing.label}
                    </h3>
                    <p className="text-2xl font-bold text-brand-500 mt-2">
                      ${pricing.monthly}
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-normal">
                        /mo
                      </span>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {PLAN_LIMITS[plan as SubscriptionPlan]} brand
                      {PLAN_LIMITS[plan as SubscriptionPlan] > 1 ? "s" : ""}
                    </p>
                    {formData.selectedPlan === plan && (
                      <Badge className="mt-3">Selected</Badge>
                    )}
                  </button>
                ))}
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300 mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCompletePlan}
                  disabled={loading}
                  className="flex-1 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    You're all set!
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Your brand "{formData.brandName}" has been created.
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                    Redirecting to dashboard...
                  </p>
                </div>
                <Loader className="h-5 w-5 animate-spin text-brand-500 mt-4" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
