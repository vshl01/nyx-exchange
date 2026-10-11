"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { UiWalletAccount } from "@wallet-standard/react";
import { ArrowDownToLine, ArrowUpFromLine, ExternalLink, Eye, EyeOff, KeyRound, RefreshCw, TriangleAlert, UserPlus, X } from "lucide-react";
import { AssetIcon } from "@/components/atoms/AssetIcon";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { AmountInput } from "@/components/molecules/AmountInput";
import { BalanceRow } from "@/components/molecules/BalanceRow";
import { SegmentedTabs } from "@/components/molecules/SegmentedTabs";
import { ASSETS, ASSET_LIST, ENDPOINTS, type AssetKey } from "@/constants/config";
import { content } from "@/constants/content";
import { fadeUp, spring, stagger } from "@/constants/motion";
import { useVault } from "@/hooks/useVault";
import { parseUnits, shortAddress } from "@/lib/format";

type Mode = "deposit" | "withdraw";

export function VaultPanel({ account }: { account: UiWalletAccount }) {
  const vault = useVault(account);
  const [mode, setMode] = useState<Mode>("deposit");
  const [assetKey, setAssetKey] = useState<AssetKey>("usdc");
  const [value, setValue] = useState("");
  const [hidden, setHidden] = useState(false);

  const asset = ASSETS[assetKey];
  const available = mode === "deposit" ? vault.publicBalances[assetKey] : vault.privateBalances[assetKey];
  const amount = parseUnits(value, asset.decimals);
  const tooMuch = amount !== null && amount > available;
  const ready = vault.phase === "ready";

  const submit = async () => {
    if (!amount) return;
    await (mode === "deposit" ? vault.deposit(assetKey, amount) : vault.withdraw(assetKey, amount));
    setValue("");
  };

  return (
    <motion.div variants={stagger(0.1)} initial="hidden" animate="show" className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
      <motion.div variants={fadeUp}>
        <Card className="p-6 sm:p-7">
          <AnimatePresence mode="wait" initial={false}>
            {!ready ? (
              <motion.div key={vault.phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <motion.span
                  animate={{ boxShadow: ["0 0 0px rgba(139,92,246,0.0)", "0 0 48px rgba(139,92,246,0.45)", "0 0 0px rgba(139,92,246,0.0)"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="grid size-16 place-items-center rounded-3xl border border-aurora-lilac/30 bg-gradient-to-br from-aurora-violet/30 to-aurora-cyan/10 text-aurora-lilac"
                >
                  {vault.phase === "locked" ? <KeyRound className="size-7" /> : <UserPlus className="size-7" />}
                </motion.span>
                <h2 className="mt-6 text-xl font-medium text-moon-50">
                  {vault.phase === "locked" ? content.vault.unlock : content.vault.register}
                </h2>
                <p className="mt-2 max-w-xs text-sm text-moon-400">
                  {vault.phase === "locked" ? content.vault.unlockHint : content.vault.registerHint}
                </p>
                <Button
                  size="lg"
                  className="mt-8"
                  loading={!!vault.busy}
                  onClick={vault.phase === "locked" ? vault.unlock : vault.activate}
                >
                  {vault.busy ?? (vault.phase === "locked" ? "Sign to unlock" : "Activate")}
                </Button>
              </motion.div>
            ) : (
              <motion.div key="ready" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <SegmentedTabs
                  id="mode"
                  value={mode}
                  onChange={(m) => {
                    setMode(m);
                    setValue("");
                  }}
                  options={[
                    { value: "deposit", label: <><ArrowDownToLine className="size-4" />Deposit</> },
                    { value: "withdraw", label: <><ArrowUpFromLine className="size-4" />Withdraw</> },
                  ]}
                />
                <SegmentedTabs
                  id="asset"
                  value={assetKey}
                  onChange={(k) => {
                    setAssetKey(k);
                    setValue("");
                  }}
                  options={ASSET_LIST.map((a) => ({
                    value: a.key,
                    label: <><AssetIcon asset={a.key} className="size-5" />{a.symbol}</>,
                  }))}
                />
                <AmountInput
                  asset={asset}
                  value={value}
                  onChange={setValue}
                  available={available}
                  availableLabel={mode === "deposit" ? "Wallet" : "Private"}
                />
                <div className="flex items-center justify-between px-1 text-xs text-moon-500">
                  <span>{mode === "deposit" ? "Wallet → Nyx → private balance" : "Private balance → Nyx → wallet"}</span>
                  <span>{mode === "withdraw" ? "ZK proof · ~10s" : "No proof needed"}</span>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  loading={!!vault.busy}
                  disabled={!amount || tooMuch}
                  onClick={submit}
                >
                  {vault.busy ?? (tooMuch ? "Not enough balance" : `${mode === "deposit" ? "Deposit" : "Withdraw"} ${asset.symbol}`)}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {vault.error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex items-start gap-2 overflow-hidden rounded-2xl border border-status-danger/20 bg-status-danger/10 p-3 text-sm text-status-danger"
              >
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                {vault.error}
              </motion.p>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="h-full p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs tracking-[0.2em] text-moon-500 uppercase">Private balance</p>
              <p className="mt-1 text-sm text-moon-400">Only you can see this.</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="px-2.5" onClick={() => setHidden((h) => !h)} title="Hide balances">
                {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="px-2.5" onClick={vault.refresh} disabled={!!vault.busy} title="Refresh">
                <RefreshCw className={vault.busy === "Syncing" ? "size-4 animate-spin" : "size-4"} />
              </Button>
            </div>
          </div>
          <div className="mt-5 space-y-1">
            {ASSET_LIST.map((a) => (
              <BalanceRow key={a.key} asset={a} amount={vault.privateBalances[a.key]} hidden={hidden || !ready} />
            ))}
          </div>
          {!ready && <p className="mt-6 text-center text-xs text-moon-500">Unlock to see your private balance.</p>}
          {vault.sessionAddress && (
            <p className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs text-moon-500">
              {content.vault.session}
              <span className="font-mono text-moon-300">{shortAddress(vault.sessionAddress)}</span>
            </p>
          )}
        </Card>
      </motion.div>

      <AnimatePresence>
        {vault.lastTx && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={spring}
            className="glass fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-2xl p-4 pr-3"
          >
            <span className="size-2 rounded-full bg-status-success shadow-[0_0_12px] shadow-status-success" />
            <span className="text-sm text-moon-50">{vault.lastTx.label}</span>
            <a
              href={ENDPOINTS.explorer(vault.lastTx.signature)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm text-aurora-lilac hover:underline"
            >
              View <ExternalLink className="size-3.5" />
            </a>
            <button onClick={vault.dismissTx} className="cursor-pointer rounded-full p-1 text-moon-500 hover:text-moon-50">
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
