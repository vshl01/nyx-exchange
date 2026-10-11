"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Logo } from "@/components/atoms/Logo";
import { WalletButton } from "@/components/molecules/WalletButton";
import { ease, spring } from "@/constants/motion";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/vault", label: "Vault" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: ease.out }}
      className="sticky top-0 z-40 px-4 pt-4"
    >
      <nav className="glass mx-auto flex max-w-5xl items-center justify-between rounded-full py-2 pr-2 pl-5">
        <Logo />
        <div className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-full px-4 py-1.5 text-sm transition-colors",
                pathname === link.href ? "text-moon-50" : "text-moon-400 hover:text-moon-100",
              )}
            >
              {pathname === link.href && (
                <motion.span layoutId="nav-pill" transition={spring} className="absolute inset-0 rounded-full bg-white/[0.07]" />
              )}
              <span className="relative">{link.label}</span>
            </Link>
          ))}
        </div>
        <WalletButton />
      </nav>
    </motion.header>
  );
}
