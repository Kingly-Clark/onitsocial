"use client";

import { motion } from "framer-motion";
import {
  PenLine,
  MessageCircle,
  BarChart3,
  Sparkles,
  Hash,
  Image,
  MessageSquare,
  Users,
  Bell,
  TrendingUp,
  PieChart,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Create content effortlessly",
    headline: "Create posts without touching a template.",
    description:
      "Tell On It what you want to say. AI generates captions, hashtags, and visuals for every platform — tailored to each audience, ready to publish.",
    color: "#2563eb",
    icon: PenLine,
    capabilities: [
      { icon: Sparkles, label: "AI-generated captions" },
      { icon: Hash, label: "Smart hashtags" },
      { icon: Image, label: "Visual suggestions" },
    ],
  },
  {
    title: "Manage your community",
    headline: "Reply to comments and DMs like you're texting a friend.",
    description:
      "Every comment, DM, and mention from every platform lands in one inbox. Respond instantly without switching tabs. Your community feels heard.",
    color: "#7c3aed",
    icon: MessageCircle,
    capabilities: [
      { icon: MessageSquare, label: "Unified inbox" },
      { icon: Users, label: "Audience insights" },
      { icon: Bell, label: "Smart notifications" },
    ],
  },
  {
    title: "Track what matters",
    headline: "See what's working and get actionable insights in seconds.",
    description:
      "Cross-platform analytics in one dashboard. Know which posts drive engagement, when your audience is active, and what to create next.",
    color: "#059669",
    icon: BarChart3,
    capabilities: [
      { icon: TrendingUp, label: "Growth tracking" },
      { icon: PieChart, label: "Engagement breakdown" },
      { icon: Zap, label: "Actionable insights" },
    ],
  },
];

export function Features() {
  return (
    <section id="features" className="w-full py-20 sm:py-28 bg-slate-50/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isReversed = index % 2 === 1;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`flex flex-col gap-10 lg:gap-16 items-center mb-24 sm:mb-32 last:mb-0 ${
                isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
              }`}
            >
              <div className="flex-1 max-w-lg">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
                  style={{
                    color: feature.color,
                    backgroundColor: `${feature.color}12`,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {feature.title}
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
                  {feature.headline}
                </h3>

                <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-8">
                  {feature.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  {feature.capabilities.map((cap, i) => {
                    const CapIcon = cap.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 font-medium"
                      >
                        <CapIcon
                          className="w-4 h-4"
                          style={{ color: feature.color }}
                        />
                        {cap.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 w-full max-w-lg">
                <div
                  className="relative rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden"
                  style={{ minHeight: 280 }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: `radial-gradient(${feature.color} 1px, transparent 1px)`,
                      backgroundSize: "20px 20px",
                    }}
                  />

                  <div className="relative p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="ml-3 text-xs text-slate-400 font-medium">
                        {feature.title}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: `${feature.color}12` }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: feature.color }}
                            />
                          </div>
                          <div className="flex-1">
                            <div
                              className="h-2.5 rounded-full"
                              style={{
                                backgroundColor: `${feature.color}15`,
                                width: `${85 - i * 15}%`,
                              }}
                            />
                          </div>
                          <div
                            className="h-2.5 w-12 rounded-full"
                            style={{ backgroundColor: `${feature.color}10` }}
                          />
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-7 h-7 rounded-full border-2 border-white"
                              style={{
                                backgroundColor: `${feature.color}${20 + i * 10}`,
                              }}
                            />
                          ))}
                        </div>
                        <div
                          className="text-xs font-semibold px-3 py-1.5 rounded-full"
                          style={{
                            color: feature.color,
                            backgroundColor: `${feature.color}12`,
                          }}
                        >
                          Active
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
