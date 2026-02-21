"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is On It?",
    answer:
      "On It is an AI-powered social media management platform. It brings together content creation, scheduling, community management, and analytics into one unified dashboard — powered by intelligent agents that do the heavy lifting for you.",
  },
  {
    question: "How does On It manage multiple platforms?",
    answer:
      "Connect your Facebook, Instagram, TikTok, YouTube, LinkedIn, and Google Business accounts in seconds. On It syncs all your platforms so you can create, schedule, and manage everything from a single place — no more tab switching.",
  },
  {
    question: "Who is On It built for?",
    answer:
      "On It is built for anyone managing social media — solo creators, small business owners, marketing teams, and agencies. Whether you're managing one brand or ten, On It scales with you.",
  },
  {
    question: "Can I schedule posts in advance?",
    answer:
      "Absolutely. On It includes a visual calendar where you can plan and schedule posts days, weeks, or months ahead. Our AI even suggests optimal posting times based on when your audience is most active.",
  },
  {
    question: "What platforms are supported?",
    answer:
      "On It currently supports Facebook, Instagram, TikTok, YouTube, LinkedIn, and Google Business Profile. We're constantly adding new platforms based on user feedback.",
  },
  {
    question: "What's included in the free plan?",
    answer:
      "The Solo plan starts at just $5/month and includes one brand account, post scheduling, basic analytics, a unified inbox, and email support — everything you need to get started.",
  },
];

function FaqItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="text-base sm:text-lg font-semibold text-slate-900 pr-4 group-hover:text-blue-600 transition-colors">
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-60 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-lg text-slate-500">
            Everything you need to know about On It
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-slate-200 bg-white px-6 sm:px-8"
        >
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-slate-500 text-sm"
        >
          Need more help?{" "}
          <a
            href="mailto:support@onit.social"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Get in touch
          </a>
        </motion.p>
      </div>
    </section>
  );
}
