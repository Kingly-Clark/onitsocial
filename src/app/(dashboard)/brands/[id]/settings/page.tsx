"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ConnectPlatform } from "@/components/brands/connect-platform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Brand, ConnectedAccount } from "@/types/database";

const BRAND_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
];

interface BrandSettings extends Brand {
  connected_accounts?: ConnectedAccount[];
}

export default function BrandSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
  });

  useEffect(() => {

    const fetchBrand = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/brands/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch brand");
        }
        const data = await response.json();
        setBrand(data.data);
        setConnectedAccounts(data.data.connected_accounts || []);
        setFormData({
          name: data.data.name,
          color: data.data.color,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load brand"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update brand");
      }

      const data = await response.json();
      setBrand(data.data);
      setSuccess("Brand updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure? This will permanently delete the brand and all its data."
      )
    ) {
      return;
    }

    if (!id) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete brand");
      }

      router.push("/brands");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete brand");
      setDeleting(false);
    }
  };

  const handleRefreshAccounts = async () => {
    if (!id) return;
    const response = await fetch(`/api/brands/${id}`);
    if (response.ok) {
      const data = await response.json();
      setBrand(data.data);
      setConnectedAccounts(data.data.connected_accounts || []);
    }
  };

  const handleSync = async () => {
    if (!id) return;
    
    setError("");
    setSuccess("");
    setSyncing(true);

    try {
      const response = await fetch(`/api/brands/${id}/sync`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to sync brand");
      }

      // Refresh brand data from API to get updated late_profile_id
      const brandResponse = await fetch(`/api/brands/${id}`);
      if (brandResponse.ok) {
        const brandData = await brandResponse.json();
        setBrand(brandData.data);
        setConnectedAccounts(brandData.data.connected_accounts || []);
      }
      
      setSuccess("Brand synced successfully! You can now connect platforms.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync brand");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell title="Brand Settings">
        <div className="p-6">
          <div className="h-96 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </DashboardShell>
    );
  }

  if (!brand) {
    return (
      <DashboardShell title="Brand Settings">
        <div className="p-6">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">
                    Brand not found
                  </p>
                  <Link href="/brands">
                    <Button variant="link" size="sm" className="mt-2">
                      Back to Brands
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Brand Settings">
      <div className="space-y-6 p-6">
        {/* Back link */}
        <Link href="/brands" className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" />
          Back to Brands
        </Link>

        {/* Error and success messages */}
        {error && (
          <div className="flex gap-3 rounded-lg bg-red-50 dark:bg-red-950 p-4 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex gap-3 rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400">
              {success}
            </p>
          </div>
        )}

        {/* Basic settings */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Information</CardTitle>
            <CardDescription>
              Update your brand name and appearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  Brand Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  disabled={saving}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  Brand Color
                </label>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {BRAND_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, color }))
                      }
                      disabled={saving}
                      className={`h-10 rounded-md border-2 transition-all ${
                        formData.color === color
                          ? "border-slate-900 dark:border-slate-50"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Connected platforms */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Platforms</CardTitle>
            <CardDescription>
              {brand.late_profile_id 
                ? `${connectedAccounts.length} of 6 platforms connected`
                : "Sync your brand to connect platforms"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!brand.late_profile_id ? (
              <div className="rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 p-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Brand Not Synced
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Your brand needs to be synced with the platform before you can connect social accounts.
                    </p>
                  </div>
                  <Button 
                    onClick={handleSync} 
                    disabled={syncing}
                    className="gap-2"
                  >
                    {syncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Sync Brand Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <ConnectPlatform
                brandId={brand.id}
                connectedAccounts={connectedAccounts}
                onConnect={handleRefreshAccounts}
                onDisconnect={handleRefreshAccounts}
              />
            )}
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">
                    Delete Brand
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Permanently delete this brand and all associated data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
