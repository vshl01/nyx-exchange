"use client";

import { createContext, use, useState, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { SelectedWalletAccountContextProvider } from "@solana/react";
import type { UiWallet } from "@wallet-standard/react";
import { CHAIN } from "@/constants/config";

const STORAGE_KEY = "nyx:wallet";

const storage = {
  getSelectedWallet: () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  storeSelectedWallet: (key: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {}
  },
  deleteSelectedWallet: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
};

const canUse = (wallet: UiWallet) =>
  wallet.chains.includes(CHAIN) &&
  wallet.features.includes("solana:signTransaction") &&
  wallet.features.includes("solana:signMessage");

const WalletModalContext = createContext<{ open: boolean; setOpen: (open: boolean) => void }>({
  open: false,
  setOpen: () => {},
});

export const useWalletModal = () => use(WalletModalContext);

export function AppProviders({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <MotionConfig reducedMotion="user">
      <SelectedWalletAccountContextProvider filterWallets={canUse} stateSync={storage}>
        <WalletModalContext value={{ open, setOpen }}>{children}</WalletModalContext>
      </SelectedWalletAccountContextProvider>
    </MotionConfig>
  );
}
