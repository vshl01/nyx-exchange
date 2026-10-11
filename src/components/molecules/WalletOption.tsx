"use client";

import { useConnect, type UiWallet } from "@wallet-standard/react";
import { useSelectedWalletAccount } from "@solana/react";
import { ChevronRight } from "lucide-react";
import { Spinner } from "@/components/atoms/Spinner";

export function WalletOption({ wallet, onDone }: { wallet: UiWallet; onDone: () => void }) {
  const [connecting, connect] = useConnect(wallet);
  const [, setAccount] = useSelectedWalletAccount();

  return (
    <button
      type="button"
      disabled={connecting}
      onClick={async () => {
        const accounts = await connect().catch(() => []);
        if (accounts[0]) {
          setAccount(accounts[0]);
          onDone();
        }
      }}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/[0.06] bg-night-800/60 p-3 text-left transition-colors hover:border-aurora-lilac/30 hover:bg-night-700/60"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={wallet.icon} alt="" className="size-9 rounded-xl" />
      <span className="flex-1 font-medium text-moon-50">{wallet.name}</span>
      {connecting ? (
        <Spinner className="text-aurora-lilac" />
      ) : (
        <ChevronRight className="size-4 text-moon-500 transition-transform group-hover:translate-x-0.5" />
      )}
    </button>
  );
}
