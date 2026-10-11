"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { content } from "@/constants/content";
import { fadeUp, stagger } from "@/constants/motion";

export function Hero() {
  const { hero } = content;
  return (
    <motion.section
      variants={stagger(0.12, 0.2)}
      initial="hidden"
      animate="show"
      className="mx-auto flex max-w-4xl flex-col items-center px-4 pt-24 pb-20 text-center sm:pt-32"
    >
      <motion.div variants={fadeUp}>
        <Badge tone="live">{hero.eyebrow}</Badge>
      </motion.div>
      <motion.h1
        variants={fadeUp}
        className="mt-8 text-5xl leading-[1.02] font-medium tracking-tight text-moon-50 sm:text-7xl"
      >
        {hero.title[0]}
        <br />
        <span className="text-aurora font-display font-normal italic">{hero.title[1]}</span>
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base leading-relaxed text-moon-300 sm:text-lg">
        {hero.body}
      </motion.p>
      <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/vault">
          <Button size="lg" className="group w-full">
            {hero.primary}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        <a href="#how">
          <Button size="lg" variant="glass" className="w-full">
            {hero.secondary}
          </Button>
        </a>
      </motion.div>
    </motion.section>
  );
}
