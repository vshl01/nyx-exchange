"use client";

import { AssetIcon } from "@/components/atoms/AssetIcon";
import type { Asset } from "@/constants/config";
import { formatUnits } from "@/lib/format";

type Props = {
  asset: Asset;
  value: string;
  onChange: (value: string) => void;
  available: bigint;
  availableLabel: string;
};

export function AmountInput({ asset, value, onChange, available, availableLabel }: Props) {
  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-night-900/70 p-5 transition-colors focus-within:border-aurora-lilac/40">
      <div className="flex items-center justify-between text-xs text-moon-400">
        <span>Amount</span>
        <button
          type="button"
          onClick={() => onChange(formatUnits(available, asset.decimals, asset.decimals).replaceAll(",", ""))}
          className="cursor-pointer transition-colors hover:text-aurora-lilac"
        >
          {availableLabel}: <span className="font-mono text-moon-200">{formatUnits(available, asset.decimals)}</span>
          <span className="ml-1.5 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-moon-300 uppercase">
            Max
          </span>
        </button>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(",", "."))}
          className="no-spinner w-full min-w-0 bg-transparent font-mono text-4xl text-moon-50 outline-none placeholder:text-moon-600"
        />
        <span className="flex items-center gap-2 rounded-full border border-white/10 bg-night-800 py-1.5 pr-3.5 pl-1.5 text-sm font-medium">
          <AssetIcon asset={asset.key} className="size-6" />
          {asset.symbol}
        </span>
      </div>
    </div>
  );
}
