"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  unreadCount?: number;
}

export function DashboardShell({
  children,
  title,
  subtitle,
  unreadCount = 0,
}: DashboardShellProps) {
  return (
    <div className="h-screen flex flex-col">
      {/* Sidebar and Main Content Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar unreadCount={unreadCount} />

        {/* Main Content Area */}
        <div className="ml-20 flex flex-1 flex-col overflow-hidden lg:ml-64">
          {/* Header */}
          <Header title={title} subtitle={subtitle} />

          {/* Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
