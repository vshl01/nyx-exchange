"use client";

import { AnimatePresence, motion } from "motion/react";
import { AssetIcon } from "@/components/atoms/AssetIcon";
import type { Asset } from "@/constants/config";
import { formatUnits } from "@/lib/format";

export function BalanceRow({ asset, amount, hidden }: { asset: Asset; amount: bigint; hidden: boolean }) {
  const text = formatUnits(amount, asset.decimals);
  return (
    <div className="flex items-center justify-between rounded-2xl px-3 py-3 transition-colors hover:bg-white/[0.03]">
      <div className="flex items-center gap-3">
        <AssetIcon asset={asset.key} className="size-9" />
        <div>
          <p className="text-sm font-medium text-moon-50">{asset.symbol}</p>
          <p className="text-xs text-moon-500">{asset.name}</p>
        </div>
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={hidden ? "hidden" : text}
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          className="font-mono text-base text-moon-100"
        >
          {hidden ? "••••" : text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
