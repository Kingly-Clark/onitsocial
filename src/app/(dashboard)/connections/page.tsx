"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader, Plus, X, Check, ExternalLink } from "lucide-react";
import { PLATFORMS } from "@/types/database";
import type { Brand, ConnectedAccount, Platform } from "@/types/database";

interface BrandWithAccounts extends Brand {
  connected_accounts: ConnectedAccount[];
}

export default function ConnectionsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandWithAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBrands();
    
    // Listen for connection success from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "CONNECTION_SUCCESS") {
        setConnecting(null);
        fetchBrands();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  async function fetchBrands() {
    try {
      const response = await fetch("/api/brands");
      if (!response.ok) throw new Error("Failed to fetch brands");
      
      const data = await response.json();
      
      // Fetch connected accounts for each brand
      const brandsWithAccounts = await Promise.all(
        data.data.map(async (brand: Brand) => {
          const brandRes = await fetch(`/api/brands/${brand.id}`);
          if (brandRes.ok) {
            const brandData = await brandRes.json();
            return brandData.data;
          }
          return { ...brand, connected_accounts: [] };
        })
      );
      
      setBrands(brandsWithAccounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load connections");
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(brandId: string, platform: Platform) {
    setError("");
    setConnecting(`${brandId}-${platform}`);

    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, platform }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get connection URL");
      }

      const data = await response.json();
      if (data.data.url) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          data.data.url,
          "OAuthConnect",
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
          throw new Error("Popup blocked. Please allow popups for this site.");
        }

        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            setConnecting(null);
            fetchBrands();
          }
        }, 500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      setConnecting(null);
    }
  }

  async function handleDisconnect(accountId: string) {
    if (!confirm("Are you sure you want to disconnect this account?")) return;

    try {
      const response = await fetch(`/api/connections/${accountId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to disconnect");
      }

      fetchBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    }
  }

  function getPlatformInfo(platformId: string) {
    return PLATFORMS.find(p => p.id === platformId) || { 
      id: platformId, 
      label: platformId, 
      color: "#6b7280",
      icon: "?" 
    };
  }

  if (loading) {
    return (
      <DashboardShell title="Connections" subtitle="Manage your social media connections">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      </DashboardShell>
    );
  }

  const totalConnections = brands.reduce(
    (sum, brand) => sum + (brand.connected_accounts?.length || 0), 
    0
  );

  return (
    <DashboardShell title="Connections" subtitle="Manage your social media connections">
      <div className="p-6 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{brands.length}</div>
              <p className="text-sm text-slate-500">Total Brands</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalConnections}</div>
              <p className="text-sm text-slate-500">Connected Accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{PLATFORMS.length}</div>
              <p className="text-sm text-slate-500">Platforms Available</p>
            </CardContent>
          </Card>
        </div>

        {/* Brands with connections */}
        {brands.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500 mb-4">No brands yet. Create a brand to connect social accounts.</p>
              <Button onClick={() => router.push("/brands")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Brand
              </Button>
            </CardContent>
          </Card>
        ) : (
          brands.map((brand) => (
            <Card key={brand.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: brand.color || "#3b82f6" }}
                    >
                      {brand.name[0].toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{brand.name}</CardTitle>
                      <CardDescription>
                        {brand.connected_accounts?.length || 0} connected accounts
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/brands/${brand.id}/settings`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!brand.late_profile_id ? (
                  <div className="text-center py-4 text-amber-600 dark:text-amber-400">
                    <p className="text-sm">This brand needs to be synced before connecting accounts.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => router.push(`/brands/${brand.id}/settings`)}
                    >
                      Go to Brand Settings
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PLATFORMS.map((platform) => {
                      const account = brand.connected_accounts?.find(
                        acc => acc.platform === platform.id
                      );
                      const isConnecting = connecting === `${brand.id}-${platform.id}`;

                      return (
                        <div
                          key={platform.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            account 
                              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30" 
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-8 w-8 rounded-md flex items-center justify-center text-white text-sm font-bold"
                                style={{ backgroundColor: platform.color }}
                              >
                                {platform.icon[0]}
                              </div>
                              <span className="font-medium text-sm">{platform.label}</span>
                            </div>
                            {account && (
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                          </div>

                          {account ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={account.platform_avatar || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {account.platform_username?.[0]?.toUpperCase() || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                  @{account.platform_username || "Connected"}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="w-full"
                                onClick={() => handleDisconnect(account.id)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Disconnect
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleConnect(brand.id, platform.id as Platform)}
                              disabled={isConnecting}
                            >
                              {isConnecting ? (
                                <>
                                  <Loader className="h-3 w-3 mr-1 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Connect
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardShell>
  );
}
