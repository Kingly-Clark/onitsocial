"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLATFORMS } from "@/types/database";
import {
  Facebook,
  Instagram,
  Music,
  Youtube,
  Linkedin,
  MapPin,
  ArrowRight,
} from "lucide-react";

const iconMap = {
  Facebook: Facebook,
  Instagram: Instagram,
  Music: Music,
  Youtube: Youtube,
  Linkedin: Linkedin,
  MapPin: MapPin,
};

export function Hero() {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 pt-32 pb-24">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Main heading and subheading */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Manage All Your Social Media in One Place
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Schedule posts, track analytics, and manage your inbox across
            Facebook, Instagram, TikTok, YouTube, LinkedIn, and Google Business
            — all from one dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-blue-300 text-white hover:bg-blue-800/30"
              >
                See Pricing
              </Button>
            </a>
          </div>

          {/* Platform icons */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {PLATFORMS.map((platform) => {
              const IconComponent =
                iconMap[platform.icon as keyof typeof iconMap];
              return (
                <div
                  key={platform.id}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <IconComponent
                      className="w-6 h-6 text-white"
                      style={{
                        color: platform.color,
                      }}
                    />
                  </div>
                  <span className="text-sm text-blue-100 font-medium">
                    {platform.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
