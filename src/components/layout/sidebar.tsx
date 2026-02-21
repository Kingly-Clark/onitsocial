"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  Inbox,
  BarChart3,
  Settings,
  Link2,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrandStore } from "@/store/brand-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  unreadCount?: number;
}

export function Sidebar({ unreadCount = 0 }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(false);
  const pathname = usePathname();
  const { brands, activeBrandId, setActiveBrand, getActiveBrand } =
    useBrandStore();

  const activeBrand = getActiveBrand();

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsOpen(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/planner", icon: PenSquare, label: "Planner" },
    { href: "/calendar", icon: Calendar, label: "Calendar" },
    { href: "/inbox", icon: Inbox, label: "Inbox", badge: unreadCount },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/connections", icon: Link2, label: "Connections" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-40 rounded-md bg-sidebar p-2 text-white lg:hidden"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar text-white transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-20",
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand Section */}
          <div className="border-b border-sidebar-hover p-4">
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "flex items-center gap-3",
                  !isOpen && "justify-center w-full"
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500 font-bold text-white">
                  O
                </div>
                {isOpen && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">Onit</span>
                    <span className="text-xs text-slate-400">Social</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Brand Switcher */}
          {isOpen && brands.length > 0 && (
            <div className="border-b border-sidebar-hover p-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full flex items-center justify-between rounded-md bg-sidebar-hover p-2 text-sm hover:bg-sidebar-active">
                  <span className="font-medium">
                    {activeBrand?.name || "Select Brand"}
                  </span>
                  <ChevronDown size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {brands.map((brand) => (
                    <DropdownMenuItem
                      key={brand.id}
                      onClick={() => setActiveBrand(brand.id)}
                      className={cn(
                        activeBrandId === brand.id &&
                          "bg-brand-500/20 text-brand-500"
                      )}
                    >
                      {brand.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={cn(
                      "w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-sidebar-active text-white"
                        : "text-slate-300 hover:bg-sidebar-hover"
                    )}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Collapse/Expand Toggle */}
          {!isMobile && (
            <div className="border-t border-sidebar-hover p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-slate-300 hover:bg-sidebar-hover hover:text-white"
              >
                {isOpen ? "Collapse" : "Expand"}
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
