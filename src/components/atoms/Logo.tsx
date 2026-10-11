import Link from "next/link";
import { colors } from "@/constants/colors";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="size-8 transition-transform duration-500 group-hover:-rotate-12" aria-hidden>
        <defs>
          <linearGradient id="moon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={colors.aurora.lilac} />
            <stop offset="1" stopColor={colors.aurora.cyan} />
          </linearGradient>
        </defs>
        <path d="M21 4.5A12 12 0 1 0 27.5 21 10 10 0 0 1 21 4.5Z" fill="url(#moon)" />
        <circle cx="25" cy="7" r="1.3" fill={colors.moon[50]} />
      </svg>
      <span className="font-display text-2xl italic tracking-tight text-moon-50">Nyx</span>
    </Link>
  );
}
