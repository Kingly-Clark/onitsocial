"use client";

import { PLATFORMS } from "@/types/database";
import {
  Facebook,
  Instagram,
  Music,
  Youtube,
  Linkedin,
  MapPin,
} from "lucide-react";

const iconMap = {
  Facebook: Facebook,
  Instagram: Instagram,
  Music: Music,
  Youtube: Youtube,
  Linkedin: Linkedin,
  MapPin: MapPin,
};

export function Platforms() {
  return (
    <section className="w-full py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Connect Your Favorite Platforms
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Connect and manage all your social accounts from one dashboard
          </p>
        </div>

        {/* Platform grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {PLATFORMS.map((platform) => {
            const IconComponent =
              iconMap[platform.icon as keyof typeof iconMap];
            return (
              <div
                key={platform.id}
                className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:bg-blue-50 transition-all duration-300 bg-slate-50"
              >
                <div className="mb-3 p-3 rounded-lg bg-white">
                  <IconComponent
                    className="w-8 h-8"
                    style={{
                      color: platform.color,
                    }}
                  />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 text-center">
                  {platform.label}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
