"use client";

import { motion } from "motion/react";
import { spring } from "@/constants/motion";
import { cn } from "@/lib/cn";

type Props<T extends string> = {
  id: string;
  value: T;
  options: { value: T; label: React.ReactNode }[];
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedTabs<T extends string>({ id, value, options, onChange, className }: Props<T>) {
  return (
    <div className={cn("flex rounded-full border border-white/[0.06] bg-night-900/80 p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            value === option.value ? "text-moon-50" : "text-moon-400 hover:text-moon-200",
          )}
        >
          {value === option.value && (
            <motion.span
              layoutId={id}
              transition={spring}
              className="absolute inset-0 rounded-full border border-white/10 bg-night-700"
            />
          )}
          <span className="relative flex items-center gap-2">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
