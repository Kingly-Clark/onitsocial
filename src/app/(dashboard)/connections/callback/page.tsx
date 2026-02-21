"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, AlertCircle, CheckCircle } from "lucide-react";

interface SelectionItem {
  id: string;
  name: string;
  username?: string;
  category?: string;
  type?: string;
}

interface OAuthData {
  profileId: string;
  tempToken: string;
  connectToken: string;
  userProfile: Record<string, unknown>;
  platform: string;
}

// Platforms that require selection step
const PLATFORMS_WITH_SELECTION = ["facebook", "linkedin", "googlebusiness", "pinterest"];

export default function ConnectionCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [items, setItems] = useState<SelectionItem[]>([]);
  const [oauthData, setOauthData] = useState<OAuthData | null>(null);

  useEffect(() => {
    const step = searchParams.get("step");
    const platform = searchParams.get("platform")?.toLowerCase();
    
    // Parse OAuth data from URL
    const profileId = searchParams.get("profileId");
    const tempToken = searchParams.get("tempToken");
    const connectToken = searchParams.get("connect_token");
    const userProfileStr = searchParams.get("userProfile");
    
    if (!profileId || !connectToken || !platform) {
      setError("Missing required OAuth parameters. Please try connecting again.");
      setLoading(false);
      return;
    }

    const data: OAuthData = {
      profileId,
      tempToken: tempToken || "",
      connectToken,
      userProfile: userProfileStr ? JSON.parse(decodeURIComponent(userProfileStr)) : {},
      platform,
    };
    setOauthData(data);

    // Check if this platform needs a selection step
    const needsSelection = step === "select_page" || 
                          step === "select_organization" || 
                          step === "select_location" ||
                          step === "select_board";
    
    if (needsSelection && PLATFORMS_WITH_SELECTION.includes(platform)) {
      fetchSelectionItems(data);
    } else {
      // For other platforms, try to complete directly
      completeConnection(data);
    }
  }, [searchParams]);

  async function fetchSelectionItems(data: OAuthData) {
    try {
      const params = new URLSearchParams({
        profileId: data.profileId,
        tempToken: data.tempToken,
        connectToken: data.connectToken,
        platform: data.platform,
      });
      
      // Use our API proxy to avoid CORS issues
      const response = await fetch(`/api/connections/select-items?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch ${data.platform} items`);
      }

      const result = await response.json();
      const itemsList = result.pages || result.organizations || result.locations || result.boards || [];
      
      if (itemsList.length === 0) {
        const platformName = data.platform.charAt(0).toUpperCase() + data.platform.slice(1);
        setError(`No ${platformName} accounts found. Make sure you have admin access.`);
        setLoading(false);
        return;
      }

      setItems(itemsList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(err instanceof Error ? err.message : "Failed to load accounts");
      setLoading(false);
    }
  }

  async function handleSelectItem(itemId: string) {
    if (!oauthData) return;
    
    setSelecting(itemId);
    setError(null);

    try {
      // Use our API proxy to avoid CORS issues
      const response = await fetch("/api/connections/select-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: oauthData.profileId,
          itemId,
          tempToken: oauthData.tempToken,
          userProfile: oauthData.userProfile,
          connectToken: oauthData.connectToken,
          platform: oauthData.platform,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to connect account");
      }

      // Save connection to our database
      await saveConnectionToDatabase(oauthData.profileId, oauthData.platform);
      
      setSuccess(true);
      
      // Close popup and notify parent window
      if (window.opener) {
        window.opener.postMessage({ type: "CONNECTION_SUCCESS", platform: oauthData.platform }, "*");
        setTimeout(() => window.close(), 1500);
      } else {
        // Not in popup, redirect normally
        setTimeout(() => {
          router.push(`/brands?connected=${oauthData.platform}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Error selecting item:", err);
      setError(err instanceof Error ? err.message : "Failed to connect account");
      setSelecting(null);
    }
  }

  async function completeConnection(data: OAuthData) {
    try {
      await saveConnectionToDatabase(data.profileId, data.platform);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/brands?connected=${data.platform}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save connection");
      setLoading(false);
    }
  }

  async function saveConnectionToDatabase(profileId: string, platform: string) {
    const response = await fetch("/api/connections/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, platform }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to save connection");
    }
  }

  if (loading) {
    return (
      <DashboardShell title="Connecting...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-500" />
            <p className="text-slate-600 dark:text-slate-400">Loading available pages...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (success) {
    return (
      <DashboardShell title="Connected!">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Successfully Connected!</h2>
            <p className="text-slate-600 dark:text-slate-400">Redirecting to your brand...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error && items.length === 0) {
    return (
      <DashboardShell title="Connection Error">
        <div className="max-w-md mx-auto mt-12 p-6">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300 mb-2">Connection Failed</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      if (window.opener) {
                        window.close();
                      } else {
                        router.push("/connections");
                      }
                    }}
                  >
                    {window.opener ? "Close" : "Back to Connections"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  const platformName = oauthData?.platform 
    ? oauthData.platform.charAt(0).toUpperCase() + oauthData.platform.slice(1) 
    : "Account";
  
  const selectionLabel = oauthData?.platform === "linkedin" ? "Organization" 
    : oauthData?.platform === "googlebusiness" ? "Location"
    : oauthData?.platform === "pinterest" ? "Board"
    : "Page";

  return (
    <DashboardShell title={`Connect ${platformName}`}>
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Select a {platformName} {selectionLabel}</CardTitle>
            <CardDescription>
              Choose which {selectionLabel.toLowerCase()} you want to connect for posting
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}
            
            <div className="grid gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item.id)}
                  disabled={selecting !== null}
                  className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-brand-500 hover:shadow-md transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                        {item.name}
                      </h3>
                      {item.username && (
                        <p className="text-sm text-brand-600 dark:text-brand-400">
                          @{item.username}
                        </p>
                      )}
                      {(item.category || item.type) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {item.category || item.type}
                        </p>
                      )}
                    </div>
                    {selecting === item.id && (
                      <Loader className="h-5 w-5 animate-spin text-brand-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
