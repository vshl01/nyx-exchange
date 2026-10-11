import { address, type Address } from "@solana/kit";

// The one place network settings, program IDs, and assets live.

export const CHAIN = "solana:devnet" as const;

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY || undefined;
const trim = (url: string) => url.replace(/\/+$/, "");

export const ENDPOINTS = {
  rpc: HELIUS_API_KEY
    ? `${trim(process.env.NEXT_PUBLIC_RPC_URL ?? "https://devnet.helius-rpc.com")}/?api-key=${HELIUS_API_KEY}`
    : "https://api.devnet.solana.com",
  indexer: trim(process.env.NEXT_PUBLIC_INDEXER_URL ?? "https://d2xah7tnhdhcom.cloudfront.net"),
  prover: trim(process.env.NEXT_PUBLIC_PROVER_URL ?? "https://d21ni15goiip6l.cloudfront.net"),
  /** Sent to the indexer, which the SDK appends as `?api-key=`. */
  apiKey: HELIUS_API_KEY,
  explorer: (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
};

export const PROGRAMS = {
  nyx: address("7KKuR3RDkgJYMzeoC2LFLEDY2NFh3BxxZd8LAYzaAQc2"),
  spp: address("sppU489D7A4U1exNo1oeMGZtLEofq3a6o2fR7UeoWB6"),
  token: address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  system: address("11111111111111111111111111111111"),
};

export type AssetKey = "usdc" | "usdt" | "sol";

export type Asset = {
  key: AssetKey;
  symbol: string;
  name: string;
  decimals: number;
  /** `undefined` for native SOL. */
  mint?: Address;
};

export const ASSETS: Record<AssetKey, Asset> = {
  usdc: {
    key: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    mint: address("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),
  },
  usdt: {
    key: "usdt",
    symbol: "USDT",
    name: "Tether (test)",
    decimals: 6,
    mint: address("E6a9VBv6WGMfdP3fJooDZG6CBqVZ4cSCUJvKi5FMrQq4"),
  },
  sol: { key: "sol", symbol: "SOL", name: "Solana", decimals: 9 },
};

export const ASSET_LIST = Object.values(ASSETS);

/** Anchor discriminators from nyx's IDL. */
export const DISCRIMINATORS = {
  deposit_usdc: [184, 148, 250, 169, 224, 213, 34, 126],
  deposit_usdt: [106, 178, 124, 96, 69, 212, 45, 75],
  deposit_sol: [108, 81, 78, 117, 125, 155, 56, 200],
  withdraw_usdc: [114, 49, 72, 184, 27, 156, 243, 155],
  withdraw_usdt: [117, 75, 94, 162, 178, 92, 19, 141],
  withdraw_sol: [145, 131, 74, 136, 65, 137, 42, 38],
} as const;
