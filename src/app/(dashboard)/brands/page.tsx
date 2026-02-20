"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { useBrandStore } from "@/store/brand-store";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BrandCard } from "@/components/brands/brand-card";
import { CreateBrandDialog } from "@/components/brands/create-brand-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS } from "@/types/database";
import type { Brand, ConnectedAccount } from "@/types/database";

interface BrandWithAccounts extends Brand {
  connected_accounts_count?: number;
  connected_accounts?: ConnectedAccount[];
}

export default function BrandsPage() {
  const { user } = useUserStore();
  const { setBrands } = useBrandStore();
  const [brands, setBrandsState] = useState<BrandWithAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const plan = user?.subscription_plan || "solo";
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];
  const used = brands.length;
  const remaining = limit - used;

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/brands");
        if (!response.ok) {
          throw new Error("Failed to fetch brands");
        }
        const data = await response.json();
        setBrandsState(data.data || []);
        setBrands(data.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load brands"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [setBrands]);

  const handleDeleteBrand = async (brandId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this brand? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(brandId);
    setDeleteError("");

    try {
      const response = await fetch(`/api/brands/${brandId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete brand");
      }

      setBrandsState((prev) => prev.filter((b) => b.id !== brandId));
      setBrands(brands.filter((b) => b.id !== brandId));
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete brand"
      );
    } finally {
      setDeleting(null);
    }
  };

  const handleRefresh = async () => {
    const response = await fetch("/api/brands");
    if (response.ok) {
      const data = await response.json();
      setBrandsState(data.data || []);
      setBrands(data.data || []);
    }
  };

  if (loading) {
    return (
      <DashboardShell
        title="Your Brands"
        subtitle="Manage your brands and connected accounts"
      >
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Your Brands"
      subtitle="Manage your brands and connected accounts"
    >
      <div className="space-y-6 p-6">
        {/* Header with stats */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Plan usage
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {used} of {limit}
              </p>
            </div>
            <div className="text-right">
              <Badge
                variant={remaining === 0 ? "destructive" : "secondary"}
              >
                {remaining} remaining
              </Badge>
            </div>
          </div>

          <CreateBrandDialog
            plan={plan as keyof typeof PLAN_LIMITS}
            used={used}
            onSuccess={handleRefresh}
          />
        </div>

        {/* Error messages */}
        {error && (
          <div className="flex gap-3 rounded-lg bg-red-50 dark:bg-red-950 p-4 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-300">
                Error
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        )}

        {deleteError && (
          <div className="flex gap-3 rounded-lg bg-red-50 dark:bg-red-950 p-4 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {deleteError}
            </p>
          </div>
        )}

        {/* Plan upgrade notice */}
        {remaining === 0 && used > 0 && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    Upgrade your plan
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                    You've reached the brand limit for your {plan} plan. Upgrade to add more brands.
                  </p>
                </div>
                <Link href="/settings/billing">
                  <Button size="sm" className="gap-2">
                    Upgrade
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brands grid */}
        {brands.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                connectedAccounts={brand.connected_accounts}
                onDelete={(id) => handleDeleteBrand(id)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="h-16 w-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m0 0h6m0-6h6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    No brands yet
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Create your first brand to get started
                  </p>
                </div>
                <CreateBrandDialog
                  plan={plan as keyof typeof PLAN_LIMITS}
                  used={used}
                  onSuccess={handleRefresh}
                  trigger={
                    <Button>Create Your First Brand</Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
