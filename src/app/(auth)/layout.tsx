import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-blue-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-brand-600 tracking-tight">
            Onit
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Manage all your social media from one place
          </p>
        </div>

        {/* Auth Container */}
        {children}
      </div>
    </div>
  );
}
