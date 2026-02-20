"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                O
              </div>
              <span className="text-slate-900">Onit</span>
            </Link>
            <p className="text-slate-600 text-sm">
              Manage all your social media in one place.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-slate-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-slate-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-slate-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@onit.social"
                  className="text-slate-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Email Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 pt-8">
          <p className="text-center text-slate-600 text-sm">
            © 2025 Onit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
