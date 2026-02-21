"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLATFORMS } from "@/types/database";
import { motion } from "framer-motion";
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

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
};

const blockVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-white pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-[1.1] tracking-tight"
          >
            Your superhuman
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              social media manager
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Built for anyone managing social media. Connect your accounts, say
            what you need. AI handles the rest.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
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

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-3 sm:gap-4"
          >
            {PLATFORMS.map((platform) => {
              const IconComponent =
                iconMap[platform.icon as keyof typeof iconMap];
              return (
                <motion.div
                  key={platform.id}
                  variants={blockVariants}
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
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
