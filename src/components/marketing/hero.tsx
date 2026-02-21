"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLATFORMS } from "@/types/database";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
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

function PlatformBlock({
  platform,
  index,
  scrollProgress,
}: {
  platform: (typeof PLATFORMS)[number];
  index: number;
  scrollProgress: MotionValue<number>;
}) {
  const IconComponent = iconMap[platform.icon as keyof typeof iconMap];
  const start = 0.02 + index * 0.03;
  const end = 0.05 + index * 0.03;

  const blockOpacity = useTransform(scrollProgress, [start, end], [0, 1]);
  const blockY = useTransform(scrollProgress, [start, end], [20, 0]);

  return (
    <motion.div
      style={{ opacity: blockOpacity, y: blockY }}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-default"
    >
      <IconComponent
        className="w-5 h-5 flex-shrink-0"
        style={{ color: platform.color }}
      />
      <span className="text-sm font-medium text-slate-700">
        {platform.label}
      </span>
    </motion.div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const subtextY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const subtextOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const ctaY = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-white pt-32 pb-24 sm:pt-40 sm:pb-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1
            style={{ y: headlineY, opacity: headlineOpacity }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-[1.1] tracking-tight"
          >
            Your superhuman
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              social media manager
            </span>
          </motion.h1>

          <motion.p
            style={{ y: subtextY, opacity: subtextOpacity }}
            className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Built for anyone managing social media. Connect your accounts, say
            what you need. AI handles the rest.
          </motion.p>

          <motion.div
            style={{ y: ctaY, opacity: ctaOpacity }}
            className="mb-16"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full gap-2 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all"
              >
                Get Started for Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {PLATFORMS.map((platform, index) => (
              <PlatformBlock
                key={platform.id}
                platform={platform}
                index={index}
                scrollProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
