"use client";

import { useState, useEffect } from "react";
import { Loader, Check, Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PLATFORMS } from "@/types/database";
import type { ConnectedAccount, Platform } from "@/types/database";

interface ConnectPlatformProps {
  brandId: string;
  connectedAccounts?: ConnectedAccount[];
  onConnect?: () => void;
  onDisconnect?: (accountId: string) => void;
}

export function ConnectPlatform({
  brandId,
  connectedAccounts = [],
  onConnect,
  onDisconnect,
}: ConnectPlatformProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Listen for messages from OAuth popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "CONNECTION_SUCCESS") {
        setLoading(null);
        onConnect?.();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onConnect]);

  const connectedPlatforms = new Set(
    connectedAccounts.map((acc) => acc.platform)
  );

  const handleConnect = async (platform: Platform) => {
    setError("");
    setLoading(platform);

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
        // Open OAuth URL in a new window
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          data.data.url,
          "OAuthConnect",
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
          throw new Error("Failed to open connection window");
        }

        // Reload after popup closes
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            onConnect?.();
          }
        }, 500);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect platform"
      );
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm("Are you sure you want to disconnect this account?")) {
      return;
    }

    setDisconnecting(accountId);
    setError("");

    try {
      const response = await fetch(`/api/connections/${accountId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to disconnect account");
      }

      onDisconnect?.(accountId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to disconnect account"
      );
    } finally {
      setDisconnecting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Connected Platforms
        </h3>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 mb-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLATFORMS.map((platform) => {
            const isConnected = connectedPlatforms.has(platform.id as Platform);
            const account = connectedAccounts.find(
              (acc) => acc.platform === platform.id
            );

            return (
              <Card
                key={platform.id}
                className={`overflow-hidden transition-all ${
                  isConnected ? "border-green-200 dark:border-green-800" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.icon[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-50">
                          {platform.label}
                        </p>
                        {isConnected && account?.platform_username && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            @{account.platform_username}
                          </p>
                        )}
                      </div>
                    </div>
                    {isConnected && (
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>

                  {isConnected && account?.platform_avatar ? (
                    <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={account.platform_avatar} />
                        <AvatarFallback>
                          {account.platform_username?.[0]?.toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                        Connected as {account.platform_username}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    {isConnected ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => account && handleDisconnect(account.id)}
                        disabled={disconnecting === account?.id}
                        className="flex-1 gap-2"
                      >
                        {disconnecting === account?.id ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Disconnecting...
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4" />
                            Disconnect
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleConnect(platform.id as Platform)
                        }
                        disabled={loading === platform.id}
                        className="flex-1 gap-2"
                      >
                        {loading === platform.id ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {account?.status && account.status !== "active" && (
                    <Badge
                      variant="secondary"
                      className="mt-2 w-full justify-center text-xs capitalize"
                    >
                      {account.status}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
