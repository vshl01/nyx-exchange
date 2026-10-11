"use client";

import { motion } from "motion/react";
import { FeatureCard } from "@/components/molecules/FeatureCard";
import { content } from "@/constants/content";
import { fadeUp, stagger } from "@/constants/motion";

export function Features() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-28">
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid gap-4 md:grid-cols-3"
      >
        {content.features.map((f) => (
          <FeatureCard key={f.title} icon={f.icon} title={f.title} body={f.body} soon={"soon" in f} />
        ))}
      </motion.div>

      <motion.div
        id="how"
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-28 scroll-mt-28"
      >
        <motion.p variants={fadeUp} className="text-center text-sm tracking-[0.2em] text-aurora-lilac uppercase">
          How it works
        </motion.p>
        <motion.h2 variants={fadeUp} className="mt-3 text-center text-3xl font-medium tracking-tight text-moon-50 sm:text-4xl">
          Four steps. <span className="font-display italic text-moon-300">Zero leaks.</span>
        </motion.h2>
        <div className="relative mt-14 grid gap-8 sm:grid-cols-4">
          <div className="absolute top-5 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-transparent via-aurora-lilac/40 to-transparent sm:block" />
          {content.steps.map((step, i) => (
            <motion.div key={step.title} variants={fadeUp} className="relative text-center">
              <span className="relative mx-auto grid size-10 place-items-center rounded-full border border-aurora-lilac/30 bg-night-850 font-mono text-sm text-aurora-lilac shadow-[0_0_24px_-4px] shadow-aurora-violet/50">
                {i + 1}
              </span>
              <h3 className="mt-5 font-medium text-moon-50">{step.title}</h3>
              <p className="mt-1.5 text-sm text-moon-400">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
