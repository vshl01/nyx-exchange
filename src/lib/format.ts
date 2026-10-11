export const shortAddress = (value: string) => `${value.slice(0, 4)}…${value.slice(-4)}`;

/** Base units to a display string, trimming trailing zeros. */
export function formatUnits(amount: bigint, decimals: number, maxFraction = 4) {
  const base = 10n ** BigInt(decimals);
  const whole = amount / base;
  const fraction = (amount % base).toString().padStart(decimals, "0").slice(0, maxFraction);
  const trimmed = fraction.replace(/0+$/, "");
  return `${whole.toLocaleString("en-US")}${trimmed ? `.${trimmed}` : ""}`;
}

/** A user-typed amount to base units, or `null` if it isn't a positive number. */
export function parseUnits(value: string, decimals: number): bigint | null {
  if (!/^\d*\.?\d*$/.test(value) || value === "" || value === ".") return null;
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > decimals) return null;
  const units = BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, "0") || "0");
  return units > 0n ? units : null;
}
