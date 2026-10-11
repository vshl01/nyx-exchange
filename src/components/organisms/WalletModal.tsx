"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSelectedWalletAccount } from "@solana/react";
import { X } from "lucide-react";
import { WalletOption } from "@/components/molecules/WalletOption";
import { spring } from "@/constants/motion";
import { useWalletModal } from "@/providers/AppProviders";

export function WalletModal() {
  const { open, setOpen } = useWalletModal();
  const [, , wallets] = useSelectedWalletAccount();
  const close = () => setOpen(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-night-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-label="Connect a wallet"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={spring}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-sm rounded-3xl p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-moon-50">Connect a wallet</h2>
              <button onClick={close} className="cursor-pointer rounded-full p-1.5 text-moon-400 hover:bg-white/5 hover:text-moon-50">
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-moon-400">Solana devnet wallets that can sign messages.</p>
            <div className="mt-5 space-y-2">
              {wallets.length === 0 && (
                <p className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-moon-400">
                  No wallet found. Install Phantom, Solflare or Backpack.
                </p>
              )}
              {wallets.map((wallet) => (
                <WalletOption key={wallet.name} wallet={wallet} onDone={close} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
