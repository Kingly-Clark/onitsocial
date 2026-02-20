import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onit - Social Media Management",
  description: "Manage all your social media brands from one dashboard. Schedule posts, track analytics, and manage your inbox across Facebook, Instagram, TikTok, YouTube, LinkedIn, and Google Business.",
  keywords: ["social media management", "scheduling", "analytics", "instagram", "tiktok", "facebook"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans">{children}</body>
    </html>
  );
}
