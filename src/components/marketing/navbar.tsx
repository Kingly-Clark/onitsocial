"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              O
            </div>
            <span className="text-slate-900">Onit</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
            >
              Pricing
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900"
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5">
                Get Started for Free
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-slate-900" />
            ) : (
              <Menu className="w-6 h-6 text-slate-900" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 space-y-4">
            <a
              href="#features"
              className="block text-slate-600 hover:text-slate-900 transition-colors font-medium py-2 text-sm"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="block text-slate-600 hover:text-slate-900 transition-colors font-medium py-2 text-sm"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </a>
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
