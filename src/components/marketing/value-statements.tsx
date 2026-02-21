"use client";

import { motion } from "framer-motion";

const statements = [
  "Stop posting into the void.",
  "No more platform juggling.",
  "All your socials. One conversation.",
];

const finalStatement = "This is how social media management should feel.";

export function ValueStatements() {
  return (
    <section className="w-full py-24 sm:py-36 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28">
        {statements.map((statement, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: "easeOut",
            }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              {statement}
            </h2>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-center pt-8"
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {finalStatement}
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
