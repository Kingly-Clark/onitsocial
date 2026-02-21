"use client";

import { TextRevealByWord } from "@/components/ui/text-reveal";

const statements = [
  "Stop posting into the void. Your content deserves to be seen by the right people, at the right time.",
  "No more platform juggling. Manage Facebook, Instagram, TikTok, LinkedIn, YouTube, and Google Business from one place.",
  "All your socials. One conversation. This is how social media management should feel.",
];

export function ValueStatements() {
  return (
    <section className="w-full bg-white">
      {statements.map((statement, index) => (
        <TextRevealByWord key={index} text={statement} />
      ))}
    </section>
  );
}
