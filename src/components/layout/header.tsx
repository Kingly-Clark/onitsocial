"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useUserStore();

  const userInitials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* New Post Button */}
          <Button
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600"
            onClick={() => {
              // TODO: Implement new post dialog
            }}
          >
            <Plus size={18} />
            New Post
          </Button>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80">
              <Avatar className="h-8 w-8">
                {user?.avatar_url && (
                  <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />
                )}
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                {user?.full_name || user?.email}
              </div>
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Navigate to profile
                }}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Navigate to settings
                }}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Implement logout
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
