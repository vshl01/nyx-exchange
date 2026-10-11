"use client";

import { motion } from "motion/react";

/** The night sky behind every page: drifting aurora glows, faint stars, and a grid. */
export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-aurora-violet/25 blur-[140px]"
        animate={{ x: ["-50%", "-42%", "-56%", "-50%"], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 -right-40 h-[420px] w-[520px] rounded-full bg-aurora-cyan/15 blur-[130px]"
        animate={{ y: [0, 60, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 -left-40 h-[380px] w-[480px] rounded-full bg-aurora-rose/10 blur-[130px]"
        animate={{ y: [0, -50, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20%_30%,white,transparent),radial-gradient(1px_1px_at_70%_20%,white,transparent),radial-gradient(1px_1px_at_40%_80%,white,transparent),radial-gradient(1px_1px_at_85%_65%,white,transparent),radial-gradient(1px_1px_at_10%_75%,white,transparent)] bg-[length:420px_420px] opacity-25" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
    </div>
  );
}
