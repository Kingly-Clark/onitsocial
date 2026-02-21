"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";

const statements = [
  { text: "Stop posting into the void.", gradient: false },
  { text: "No more platform juggling.", gradient: false },
  { text: "All your socials. One conversation.", gradient: false },
  {
    text: "This is how social media management should feel.",
    gradient: true,
  },
];

export function ValueStatements() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const sectionOpacity = useTransform(
    scrollYProgress,
    [0, 0.04, 0.94, 1],
    [0, 1, 1, 0]
  );

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const segment = 1 / statements.length;
    const newIndex = Math.min(
      Math.floor(latest / segment),
      statements.length - 1
    );
    if (newIndex !== activeIndex && newIndex >= 0) {
      setActiveIndex(newIndex);
    }
  });

  return (
    <section
      ref={containerRef}
      className="relative bg-white"
      style={{ height: `${(statements.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ opacity: sectionOpacity }}
          className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center"
        >
          <div className="relative h-32 sm:h-40 flex items-center justify-center">
            {statements.map((statement, index) => (
              <motion.h2
                key={index}
                initial={false}
                animate={{
                  opacity: index === activeIndex ? 1 : 0,
                  y: index === activeIndex ? 0 : index < activeIndex ? -40 : 40,
                  scale: index === activeIndex ? 1 : 0.95,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`absolute inset-0 flex items-center justify-center text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight ${
                  statement.gradient
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    : "text-slate-900"
                }`}
              >
                {statement.text}
              </motion.h2>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-12">
            {statements.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === activeIndex
                    ? "bg-blue-600 w-8"
                    : i < activeIndex
                      ? "bg-blue-200 w-4"
                      : "bg-slate-200 w-4"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
