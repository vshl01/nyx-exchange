import { colors } from "@/constants/colors";
import type { AssetKey } from "@/constants/config";
import { cn } from "@/lib/cn";

export function AssetIcon({ asset, className }: { asset: AssetKey; className?: string }) {
  const size = cn("size-7 shrink-0", className);
  if (asset === "sol") {
    return (
      <svg viewBox="0 0 32 32" className={size} aria-hidden>
        <defs>
          <linearGradient id="sol" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor={colors.asset.solFrom} />
            <stop offset="1" stopColor={colors.asset.solTo} />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill={colors.night[800]} />
        <path d="M11 10h12l-2.5 2.5H8.5zM8.5 14.75h12l2.5 2.5H11zM11 19.5h12L20.5 22H8.5z" fill="url(#sol)" />
      </svg>
    );
  }
  const fill = asset === "usdc" ? colors.asset.usdc : colors.asset.usdt;
  return (
    <svg viewBox="0 0 32 32" className={size} aria-hidden>
      <circle cx="16" cy="16" r="16" fill={fill} />
      <text
        x="16"
        y="21.5"
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fill="white"
        fontFamily="ui-sans-serif, system-ui"
      >
        {asset === "usdc" ? "$" : "₮"}
      </text>
    </svg>
  );
}
