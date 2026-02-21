"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import {
  PenLine,
  MessageCircle,
  BarChart3,
  MousePointer2,
} from "lucide-react";

const agents = [
  {
    id: "content-creator",
    label: "Content Creator",
    action: "Creating engaging posts",
    icon: PenLine,
    color: "#2563eb",
    mockup: {
      title: "AI-Powered Content Creation",
      items: [
        { platform: "Instagram", type: "Carousel", status: "Ready" },
        { platform: "LinkedIn", type: "Article", status: "Drafting..." },
        { platform: "TikTok", type: "Short Video", status: "Ready" },
        { platform: "Facebook", type: "Story", status: "Scheduled" },
      ],
    },
  },
  {
    id: "community-manager",
    label: "Community Manager",
    action: "Managing comments and DMs",
    icon: MessageCircle,
    color: "#7c3aed",
    mockup: {
      title: "Unified Inbox",
      items: [
        { platform: "Instagram", type: "@user: Love this!", status: "Reply" },
        { platform: "Facebook", type: "New message from Sarah", status: "Open" },
        { platform: "TikTok", type: "5 new comments", status: "Review" },
        { platform: "LinkedIn", type: "Connection request", status: "Accept" },
      ],
    },
  },
  {
    id: "analytics-agent",
    label: "Analytics Agent",
    action: "Tracking performance metrics",
    icon: BarChart3,
    color: "#059669",
    mockup: {
      title: "Performance Dashboard",
      items: [
        { platform: "Overall", type: "Engagement up 24%", status: "+24%" },
        { platform: "Instagram", type: "Reach: 12.4K", status: "Trending" },
        { platform: "LinkedIn", type: "Impressions: 8.2K", status: "+18%" },
        { platform: "TikTok", type: "Views: 45.1K", status: "Viral" },
      ],
    },
  },
];

function MockupPanel({ agent }: { agent: (typeof agents)[number] }) {
  return (
    <motion.div
      key={agent.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
    >
      <div
        className="px-6 py-4 border-b border-slate-100 flex items-center gap-3"
        style={{ backgroundColor: `${agent.color}08` }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: agent.color }}
        />
        <span className="text-sm font-semibold text-slate-700">
          {agent.mockup.title}
        </span>
        <span className="ml-auto text-xs text-slate-400 font-medium">
          {agent.action}
        </span>
      </div>

      <div className="p-6 space-y-3">
        {agent.mockup.items.map((item, i) => (
          <motion.div
            key={`${agent.id}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.25 }}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: agent.color }}
              />
              <div>
                <span className="text-xs text-slate-400 font-medium">
                  {item.platform}
                </span>
                <p className="text-sm font-medium text-slate-700">
                  {item.type}
                </p>
              </div>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                color: agent.color,
                backgroundColor: `${agent.color}12`,
              }}
            >
              {item.status}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function AgentShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const sectionOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.92, 1],
    [0, 1, 1, 0]
  );

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const segment = 1 / agents.length;
    const newIndex = Math.min(
      Math.floor(latest / segment),
      agents.length - 1
    );
    if (newIndex !== activeIndex && newIndex >= 0) {
      setActiveIndex(newIndex);
    }
  });

  const activeAgent = agents[activeIndex];

  return (
    <section
      ref={containerRef}
      className="relative bg-slate-50/50"
      style={{ height: `${(agents.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div
          style={{ opacity: sectionOpacity }}
          className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              AI agents that work for you
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Scroll to see how three specialized agents handle your social media
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {agents.map((agent, index) => {
              const Icon = agent.icon;
              const isActive = index === activeIndex;

              return (
                <div
                  key={agent.id}
                  className={`relative text-left p-5 rounded-xl border-2 transition-all duration-500 ${
                    isActive
                      ? "border-blue-600 bg-white shadow-lg shadow-blue-600/10 scale-[1.02]"
                      : "border-slate-200 bg-white/70 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-500"
                      style={{
                        backgroundColor: isActive
                          ? `${agent.color}15`
                          : "#f1f5f9",
                      }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{
                          color: isActive ? agent.color : "#94a3b8",
                        }}
                      />
                    </div>
                    <h3
                      className={`font-semibold text-sm transition-colors duration-500 ${
                        isActive ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {agent.label}
                    </h3>
                  </div>
                  <p
                    className={`text-xs pl-12 transition-colors duration-500 ${
                      isActive ? "text-slate-500" : "text-slate-300"
                    }`}
                  >
                    {agent.action}
                  </p>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 4 }}
                        transition={{
                          type: "spring" as const,
                          stiffness: 400,
                          damping: 25,
                        }}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full z-10"
                      >
                        <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-full shadow-lg mt-2">
                          <MousePointer2 className="w-3 h-3" />
                          <span className="text-xs font-medium whitespace-nowrap">
                            {agent.label}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <AnimatePresence mode="wait">
              <MockupPanel agent={activeAgent} />
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
