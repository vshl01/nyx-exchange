"use client";

import { motion } from "motion/react";
import { useSelectedWalletAccount } from "@solana/react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { content } from "@/constants/content";
import { fadeUp, stagger } from "@/constants/motion";
import { useWalletModal } from "@/providers/AppProviders";
import { VaultPanel } from "./VaultPanel";

export function Vault() {
  const [account] = useSelectedWalletAccount();
  const { setOpen } = useWalletModal();

  return (
    <section className="mx-auto max-w-5xl px-4 pt-16 pb-24">
      <motion.div variants={stagger(0.1)} initial="hidden" animate="show" className="mb-10">
        <motion.h1 variants={fadeUp} className="text-4xl font-medium tracking-tight text-moon-50 sm:text-5xl">
          Your <span className="text-aurora font-display italic">{content.vault.title.toLowerCase()}</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-3 text-moon-400">
          {content.vault.body}
        </motion.p>
      </motion.div>

      {account ? (
        <VaultPanel key={account.address} account={account} />
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <Card className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
            <Wallet className="size-10 text-aurora-lilac" />
            <p className="mt-5 text-lg text-moon-50">{content.vault.connect}</p>
            <Button size="lg" className="mt-8" onClick={() => setOpen(true)}>
              Connect wallet
            </Button>
          </Card>
        </motion.div>
      )}
    </section>
  );
}
