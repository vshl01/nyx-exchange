"use client";

import { useSelectedWalletAccount } from "@solana/react";
import { LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useWalletModal } from "@/providers/AppProviders";
import { shortAddress } from "@/lib/format";

export function WalletButton() {
  const [account, setAccount] = useSelectedWalletAccount();
  const { setOpen } = useWalletModal();

  if (!account) {
    return (
      <Button size="sm" variant="glass" onClick={() => setOpen(true)}>
        <Wallet className="size-4" />
        Connect
      </Button>
    );
  }
  return (
    <Button size="sm" variant="glass" onClick={() => setAccount(undefined)} className="group" title="Disconnect">
      <span className="size-2 rounded-full bg-status-success shadow-[0_0_10px] shadow-status-success" />
      <span className="font-mono">{shortAddress(account.address)}</span>
      <LogOut className="size-3.5 text-moon-500 transition-colors group-hover:text-status-danger" />
    </Button>
  );
}
