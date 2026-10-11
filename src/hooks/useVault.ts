"use client";

import { useCallback, useRef, useState } from "react";
import { address, getTransactionEncoder, type Address, type Transaction } from "@solana/kit";
import { useSignMessage, useSignTransaction } from "@solana/react";
import type { UiWalletAccount } from "@wallet-standard/react";
import { ASSETS, ASSET_LIST, CHAIN, type AssetKey } from "@/constants/config";
import {
  UNLOCK_MESSAGE,
  compileV1,
  depositInstruction,
  deriveSession,
  fundingTransaction,
  getClient,
  publicBalance,
  sendSigned,
  sendWithSession,
  wrapWithdrawal,
  type Session,
} from "@/lib/nyx";

export type Phase = "locked" | "unregistered" | "ready";
export type Balances = Record<AssetKey, bigint>;
export type TxResult = { label: string; signature: string };

const empty: Balances = { usdc: 0n, usdt: 0n, sol: 0n };

const hints: Record<string, string> = {
  CLIENT_RPC: "RPC request failed. Check NEXT_PUBLIC_RPC_URL in .env.local.",
  WALLET_INSUFFICIENT_BALANCE: "Not enough private balance.",
};

/** The SDK wraps errors in errors: show the whole chain of codes, with a hint for known ones. */
function message(error: unknown) {
  const codes: string[] = [];
  for (let e = error; e instanceof Error; e = e.cause) {
    codes.push((e as Error & { code?: string }).code ?? e.message.split("\n")[0]);
  }
  const hint = codes.map((c) => hints[c]).find(Boolean);
  return [hint, codes.join(" ← ")].filter(Boolean).join(" ") || "Something went wrong";
}

/**
 * The vault for a connected wallet. The wallet signs once to derive the Nyx session key, which
 * signs every v1 transaction; the wallet itself only signs legacy transfers that fund the session.
 */
export function useVault(account: UiWalletAccount) {
  const owner = address(account.address) as Address;
  const signMessage = useSignMessage(account);
  const signTransaction = useSignTransaction(account, CHAIN);

  const session = useRef<Session | null>(null);
  const [sessionAddress, setSessionAddress] = useState<Address | null>(null);
  const [phase, setPhase] = useState<Phase>("locked");
  const [privateBalances, setPrivate] = useState<Balances>(empty);
  const [publicBalances, setPublic] = useState<Balances>(empty);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<TxResult | null>(null);

  const run = useCallback(async (label: string, task: () => Promise<void>) => {
    setBusy(label);
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(null);
    }
  }, []);

  /** The wallet signs and we send: only legacy funding transfers, which every wallet can sign. */
  const sendFromWallet = useCallback(
    async (tx: Transaction) => {
      const { signedTransaction } = await signTransaction({
        transaction: new Uint8Array(getTransactionEncoder().encode(tx)),
      });
      return sendSigned(signedTransaction);
    },
    [signTransaction],
  );

  /** Funds the session with `amount` of `asset`, and tops up its SOL for fees when it runs low. */
  const fund = useCallback(
    async (s: Session, key?: AssetKey, amount?: bigint) => {
      const tx = await fundingTransaction(owner, s.signer.address, key ? ASSETS[key] : undefined, amount);
      if (tx) await sendFromWallet(tx);
    },
    [owner, sendFromWallet],
  );

  const sync = useCallback(
    async (slot?: bigint) => {
      const z = await import("@heliuslabs/zolana");
      const client = await getClient();
      const pub = await Promise.all(ASSET_LIST.map((a) => publicBalance(owner, a)));
      setPublic({ usdc: pub[0], usdt: pub[1], sol: pub[2] });
      const s = session.current;
      if (!s) return;
      await z.syncWallet({ client, wallet: s.wallet, keys: s.keys, config: slot ? { requireSlot: slot } : undefined });
      const next = { ...empty };
      for (const b of z.getPrivateTokenBalances(s.wallet)) {
        const asset = ASSET_LIST.find((a) => (a.mint ?? z.SOL_MINT) === b.mint);
        if (asset) next[asset.key] = b.amount;
      }
      setPrivate(next);
    },
    [owner],
  );

  const registration = async (s: Session) => {
    const z = await import("@heliuslabs/zolana");
    const client = await getClient();
    return z.buildRegistrationTransaction({ client, owner: s.signer.address, address: s.keys.address() });
  };

  const unlock = () =>
    run("Unlocking", async () => {
      const { signature } = await signMessage({ message: UNLOCK_MESSAGE });
      const s = await deriveSession(owner, signature);
      session.current = s;
      setSessionAddress(s.signer.address);
      setPhase((await registration(s)) ? "unregistered" : "ready");
      await sync();
    });

  /** One time: fund the session's rent and fees, then register its private keys with Helius. */
  const activate = () =>
    run("Activating", async () => {
      const s = session.current!;
      await fund(s);
      const tx = await registration(s);
      if (tx) {
        const { signature } = await sendWithSession(s, tx);
        setLastTx({ label: "Account activated", signature });
      }
      setPhase("ready");
    });

  const deposit = (key: AssetKey, amount: bigint) =>
    run("Depositing", async () => {
      const s = session.current!;
      const client = await getClient();
      await fund(s, key, amount);
      const ix = await depositInstruction(ASSETS[key], s.signer.address, amount, client.tree);
      const tx = compileV1(s.signer.address, [ix], await client.getLatestBlockhash(), "deposit");
      const { signature, slot } = await sendWithSession(s, tx);
      setLastTx({ label: `Deposited ${ASSETS[key].symbol}`, signature });
      await sync(slot);
    });

  const withdraw = (key: AssetKey, amount: bigint) =>
    run("Proving & withdrawing", async () => {
      const z = await import("@heliuslabs/zolana");
      const s = session.current!;
      const client = await getClient();
      await fund(s);
      const sdkTx = await z.buildWithdrawalTransaction({
        client,
        wallet: s.wallet,
        keys: s.keys,
        feePayer: s.signer.address,
        recipient: owner,
        amount,
        asset: ASSETS[key].mint,
      });
      const ixs = await wrapWithdrawal(sdkTx, ASSETS[key], s.signer.address);
      const tx = compileV1(s.signer.address, ixs, await client.getLatestBlockhash(), "withdraw");
      const { signature, slot } = await sendWithSession(s, tx);
      setLastTx({ label: `Withdrew ${ASSETS[key].symbol}`, signature });
      await sync(slot);
    });

  const refresh = () => run("Syncing", () => sync());

  return {
    phase,
    sessionAddress,
    privateBalances,
    publicBalances,
    busy,
    error,
    lastTx,
    unlock,
    activate,
    deposit,
    withdraw,
    refresh,
    dismissTx: () => setLastTx(null),
  };
}
