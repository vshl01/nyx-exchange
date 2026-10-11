"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { spring } from "@/constants/motion";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type Props = HTMLMotionProps<"button"> & {
  variant?: "primary" | "glass" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

const variants = {
  primary:
    "text-night-950 bg-gradient-to-r from-aurora-lilac via-moon-50 to-aurora-cyan shadow-[0_0_40px_-8px] shadow-aurora-violet/60 hover:shadow-aurora-cyan/60",
  glass: "glass text-moon-100 hover:bg-night-700/70 hover:border-white/15",
  ghost: "text-moon-300 hover:text-moon-50 hover:bg-white/5",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

export function Button({ variant = "primary", size = "md", loading, disabled, className, children, ...rest }: Props) {
  return (
    <motion.button
      whileHover={disabled || loading ? undefined : { y: -1 }}
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      transition={spring}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium transition-[background,box-shadow,border-color,color] duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading && <Spinner />}
      {children as React.ReactNode}
    </motion.button>
  );
}
