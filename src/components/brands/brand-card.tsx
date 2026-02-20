"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Settings, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PLATFORMS } from "@/types/database";
import type { Brand, ConnectedAccount } from "@/types/database";

interface BrandCardProps {
  brand: Brand & { connected_accounts_count?: number };
  connectedAccounts?: ConnectedAccount[];
  onDelete?: (brandId: string) => void;
}

export function BrandCard({
  brand,
  connectedAccounts = [],
  onDelete,
}: BrandCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const connectedCount = connectedAccounts.length;
  const totalPlatforms = PLATFORMS.length;

  // Get unique platform types connected
  const connectedPlatforms = connectedAccounts.map((acc) => acc.platform);
  const platformIcons = PLATFORMS.filter((p) =>
    connectedPlatforms.includes(p.id)
  );

  const initials = brand.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with brand logo and menu */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: brand.color || "#3b82f6" }}
              >
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-50 truncate">
                  {brand.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {connectedCount} of {totalPlatforms} platforms
                </p>
              </div>
            </div>

            {/* Menu button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <MoreVertical className="h-5 w-5 text-slate-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-10">
                  <Link
                    href={`/brands/${brand.id}/settings`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 first:rounded-t-lg"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      onDelete?.(brand.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 w-full text-left last:rounded-b-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Connected platforms */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Connected Platforms
            </p>
            <div className="flex flex-wrap gap-2">
              {platformIcons.length > 0 ? (
                platformIcons.map((platform) => {
                  const account = connectedAccounts.find(
                    (acc) => acc.platform === platform.id
                  );
                  return (
                    <div
                      key={platform.id}
                      className="flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800"
                    >
                      <div
                        className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.icon[0]}
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {account?.platform_username || platform.label}
                      </span>
                    </div>
                  );
                })
              ) : (
                <Badge variant="secondary" className="text-xs">
                  No platforms connected
                </Badge>
              )}
            </div>
          </div>

          {/* Action button */}
          <Link href={`/brands/${brand.id}/settings`} className="block">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
            >
              View Settings
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
