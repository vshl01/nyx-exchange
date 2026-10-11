"use client";

import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { Gavel, Repeat2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { fadeUp } from "@/constants/motion";

const icons = { shield: ShieldCheck, swap: Repeat2, gavel: Gavel };

type Props = { icon: keyof typeof icons; title: string; body: string; soon?: boolean };

/** A card with a spotlight that follows the cursor. */
export function FeatureCard({ icon, title, body, soon }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${x}px ${y}px, rgb(183 156 255 / 0.14), transparent 70%)`;
  const Icon = icons[icon];

  return (
    <motion.div
      variants={fadeUp}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);
      }}
      whileHover={{ y: -4 }}
      className="glass group relative overflow-hidden rounded-3xl p-7"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-aurora-violet/25 to-aurora-cyan/10 text-aurora-lilac">
            <Icon className="size-5" />
          </span>
          {soon ? <Badge>Soon</Badge> : <Badge tone="live">Live</Badge>}
        </div>
        <h3 className="mt-6 text-lg font-medium text-moon-50">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-moon-400">{body}</p>
      </div>
    </motion.div>
  );
}
