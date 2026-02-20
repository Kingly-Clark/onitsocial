"use client";

import {
  Zap,
  Calendar,
  MessageSquare,
  BarChart3,
  Layout,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Layout,
    title: "Multi-Brand Management",
    description: "Manage multiple brands from a single account",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Plan and schedule posts across all platforms",
  },
  {
    icon: MessageSquare,
    title: "Unified Inbox",
    description: "Reply to comments and DMs in one place",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track performance across all your accounts",
  },
  {
    icon: Calendar,
    title: "Calendar View",
    description: "Visualize your content calendar at a glance",
  },
  {
    icon: Globe,
    title: "Multi-Platform",
    description: "Connect 6+ social media platforms",
  },
];

export function Features() {
  return (
    <section id="features" className="w-full py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Powerful Features for Modern Teams
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to manage your social media presence efficiently
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-slate-50 hover:bg-blue-50"
              >
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
