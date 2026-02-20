"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, RefreshCw, Filter } from "lucide-react";
import type { Platform } from "@/types/database";

interface InboxToolbarProps {
  onSearch: (query: string) => void;
  onFilterPlatform: (platform: Platform | null) => void;
  onFilterReadStatus: (status: "all" | "read" | "unread") => void;
  onFilterResolved: (status: "all" | "resolved" | "unresolved") => void;
  onSync: () => Promise<void>;
  unreadCount: number;
  isSyncing: boolean;
  searchQuery: string;
  activePlatformFilter: Platform | null;
  activeReadFilter: "all" | "read" | "unread";
  activeResolvedFilter: "all" | "resolved" | "unresolved";
}

const PLATFORMS: Array<{ id: Platform; label: string }> = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "google_business", label: "Google Business" },
];

export function InboxToolbar({
  onSearch,
  onFilterPlatform,
  onFilterReadStatus,
  onFilterResolved,
  onSync,
  unreadCount,
  isSyncing,
  searchQuery,
  activePlatformFilter,
  activeReadFilter,
  activeResolvedFilter,
}: InboxToolbarProps) {
  const [isSearching, setIsSearching] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3">
      {/* Search and Sync */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => {
              setIsSearching(e.target.value.length > 0);
              onSearch(e.target.value);
            }}
            className="pl-9"
          />
        </div>

        <Button
          onClick={onSync}
          disabled={isSyncing}
          variant="outline"
          size="sm"
          className="flex-shrink-0"
        >
          <RefreshCw
            className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
          />
        </Button>

        {unreadCount > 0 && (
          <Badge variant="default" className="ml-2 flex-shrink-0">
            {unreadCount} new
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Filter:
        </span>

        {/* Platform Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant={activePlatformFilter ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              <Filter className="w-3 h-3 mr-1" />
              Platform
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="px-2 py-1.5 text-sm font-medium">Select Platform</div>
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
            <DropdownMenuItem onClick={() => onFilterPlatform(null)}>
              All Platforms
            </DropdownMenuItem>
            {PLATFORMS.map((platform) => (
              <DropdownMenuItem
                key={platform.id}
                onClick={() => onFilterPlatform(platform.id)}
              >
                {platform.label}
                {activePlatformFilter === platform.id && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Read Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant={activeReadFilter !== "all" ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              <Filter className="w-3 h-3 mr-1" />
              Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="px-2 py-1.5 text-sm font-medium">Read Status</div>
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
            <DropdownMenuItem onClick={() => onFilterReadStatus("all")}>
              All Messages
              {activeReadFilter === "all" && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterReadStatus("unread")}>
              Unread
              {activeReadFilter === "unread" && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterReadStatus("read")}>
              Read
              {activeReadFilter === "read" && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Resolution Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant={activeResolvedFilter !== "all" ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              <Filter className="w-3 h-3 mr-1" />
              Resolution
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="px-2 py-1.5 text-sm font-medium">Resolution Status</div>
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
            <DropdownMenuItem onClick={() => onFilterResolved("all")}>
              All
              {activeResolvedFilter === "all" && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterResolved("unresolved")}>
              Unresolved
              {activeResolvedFilter === "unresolved" && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterResolved("resolved")}>
              Resolved
              {activeResolvedFilter === "resolved" && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
