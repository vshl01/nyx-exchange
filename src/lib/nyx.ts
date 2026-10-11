// Builds nyx's deposit and withdraw instructions, and wraps Helius's SDK around them.
// Everything here runs in the browser only: the SDK is imported lazily.

import {
  AccountRole,
  appendTransactionMessageInstructions,
  compileTransaction,
  createKeyPairSignerFromPrivateKeyBytes,
  createNoopSigner,
  createTransactionMessage,
  decompileTransactionMessage,
  getAddressEncoder,
  getBase64EncodedWireTransaction,
  getCompiledTransactionMessageDecoder,
  getProgramDerivedAddress,
  getSignatureFromTransaction,
  getTransactionDecoder,
  getU32Encoder,
  getU64Encoder,
  getU8Encoder,
  pipe,
  setTransactionMessageConfig,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransaction,
  type Address,
  type Blockhash,
  type Instruction,
  type Transaction,
} from "@solana/kit";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstructionAsync,
  getTransferCheckedInstruction,
} from "@solana-program/token";
import { getTransferSolInstruction } from "@solana-program/system";
import { ed25519 } from "@noble/curves/ed25519.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import type { Bytes32, createZolanaClient } from "@heliuslabs/zolana";
import { DISCRIMINATORS, ENDPOINTS, PROGRAMS, type Asset } from "@/constants/config";

export type ZolanaClient = Awaited<ReturnType<typeof createZolanaClient>>;

const DEPOSIT_CU = 200_000;
const WITHDRAW_CU = 1_400_000;
const LOADED_ACCOUNTS_LIMIT = 64 * 1024 * 1024;

let client: Promise<ZolanaClient> | undefined;

export function getClient() {
  client ??= import("@heliuslabs/zolana").then((z) =>
    z.createZolanaClient({
      solanaRpcUrl: ENDPOINTS.rpc,
      indexerUrl: ENDPOINTS.indexer,
      proverUrl: ENDPOINTS.prover,
      ...(ENDPOINTS.apiKey ? { apiKey: ENDPOINTS.apiKey } : {}),
    }),
  );
  return client;
}

const addressBytes = (value: Address) => getAddressEncoder().encode(value);

const bytes = (...parts: ArrayLike<number>[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

const pda = (programAddress: Address, seeds: (string | Uint8Array)[]) =>
  getProgramDerivedAddress({ programAddress, seeds });

/** What the wallet signs once to derive the Nyx session key. */
export const UNLOCK_MESSAGE = new TextEncoder().encode(
  "Nyx: unlock your private account\n\nThis creates your Nyx session key on devnet. It moves no funds.",
);

export type Session = Awaited<ReturnType<typeof deriveSession>>;

/**
 * The Nyx session key behind `owner`'s signature of `UNLOCK_MESSAGE`. Helius Privacy only takes
 * v1 transactions, which most wallets can't sign yet, so this key signs them: it is the nyx trader
 * and owns the private balance, and the wallet only funds it. Ed25519 signatures are deterministic,
 * so the same wallet always gets the same session back.
 */
export async function deriveSession(owner: Address, signature: Uint8Array) {
  const seed = new Uint8Array(signature);
  if (!ed25519.verify(seed, UNLOCK_MESSAGE, new Uint8Array(addressBytes(owner)), { zip215: false })) {
    throw new Error("Your wallet signed a different message. Try another wallet.");
  }
  const sessionSeed = hkdf(sha256, seed, undefined, new TextEncoder().encode("nyx/session/v1"), 32);
  const z = await import("@heliuslabs/zolana");
  const zolana = await getClient();
  // The SDK's software-signer setup: one Ed25519 seed is both the Solana signer and the private keys.
  const signer = await createKeyPairSignerFromPrivateKeyBytes(sessionSeed);
  const shielded = z.ShieldedKeypair.fromKeypair(z.SigningKey.fromEd25519Bytes(sessionSeed as Bytes32));
  const keys = z.LocalKeys.fromKeypair(shielded, zolana.proofService);
  sessionSeed.fill(0);
  seed.fill(0);
  return { signer, keys, wallet: new z.Wallet({ identity: keys.address() }) };
}

const MIN_SESSION_LAMPORTS = 5_000_000n;
const TOP_UP_LAMPORTS = 10_000_000n;

/**
 * The legacy transaction, which any wallet can sign, that moves `amount` of `asset` from `owner`
 * to the session, plus SOL for the session's fees and rent when it runs low. `null` if there's
 * nothing to send.
 */
export async function fundingTransaction(owner: Address, session: Address, asset?: Asset, amount = 0n) {
  const zolana = await getClient();
  const from = createNoopSigner(owner);
  const topUp = (await zolana.getBalance(session)) < MIN_SESSION_LAMPORTS ? TOP_UP_LAMPORTS : 0n;
  const instructions: Instruction[] = [];

  const lamports = (asset && !asset.mint ? amount : 0n) + topUp;
  if (lamports > 0n) {
    instructions.push(getTransferSolInstruction({ source: from, destination: session, amount: lamports }));
  }
  if (asset?.mint && amount > 0n) {
    const [[source], [destination]] = await Promise.all([
      findAssociatedTokenPda({ owner, mint: asset.mint, tokenProgram: PROGRAMS.token }),
      findAssociatedTokenPda({ owner: session, mint: asset.mint, tokenProgram: PROGRAMS.token }),
    ]);
    instructions.push(
      await getCreateAssociatedTokenIdempotentInstructionAsync({ payer: from, owner: session, mint: asset.mint }),
      getTransferCheckedInstruction({ source, mint: asset.mint, destination, authority: from, amount, decimals: asset.decimals }),
    );
  }
  if (instructions.length === 0) return null;

  const lifetime = await zolana.getLatestBlockhash();
  return pipe(
    createTransactionMessage({ version: "legacy" }),
    (tx) => setTransactionMessageFeePayer(owner, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(lifetime, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx),
    compileTransaction,
  );
}

/** Signs a transaction whose only signer is the session, and sends it. */
export async function sendWithSession(session: Session, transaction: Transaction) {
  return sendTransaction(await signTransaction([session.signer.keyPair], transaction));
}

/** nyx's deposit for `asset`: moves `amount` from `trader`'s account into its private balance. */
export async function depositInstruction(
  asset: Asset,
  trader: Address,
  amount: bigint,
  tree: Address,
): Promise<Instruction> {
  const { getUserRecordAddress, getSolInterfaceAddress } = await import("@heliuslabs/zolana/addresses");
  const [[config], [traderAccount], userRecord] = await Promise.all([
    pda(PROGRAMS.nyx, ["config"]),
    pda(PROGRAMS.nyx, ["trader", new Uint8Array(addressBytes(trader))]),
    getUserRecordAddress(trader),
  ]);
  const head = [
    { address: trader, role: AccountRole.WRITABLE_SIGNER },
    { address: config, role: AccountRole.READONLY },
    { address: traderAccount, role: AccountRole.WRITABLE },
    { address: userRecord, role: AccountRole.READONLY },
  ];
  const amountBytes = getU64Encoder().encode(amount);

  if (!asset.mint) {
    return {
      programAddress: PROGRAMS.nyx,
      accounts: [
        ...head,
        { address: getSolInterfaceAddress(), role: AccountRole.WRITABLE },
        { address: tree, role: AccountRole.WRITABLE },
        { address: PROGRAMS.spp, role: AccountRole.READONLY },
        { address: PROGRAMS.system, role: AccountRole.READONLY },
      ],
      data: bytes(DISCRIMINATORS.deposit_sol, amountBytes),
    };
  }

  const [[splInterface, bump], [tokenAccount]] = await Promise.all([
    pda(PROGRAMS.spp, ["spl_asset_vault", new Uint8Array(addressBytes(asset.mint))]),
    findAssociatedTokenPda({ owner: trader, mint: asset.mint, tokenProgram: PROGRAMS.token }),
  ]);
  const disc = asset.key === "usdc" ? DISCRIMINATORS.deposit_usdc : DISCRIMINATORS.deposit_usdt;
  return {
    programAddress: PROGRAMS.nyx,
    accounts: [
      ...head,
      { address: asset.mint, role: AccountRole.READONLY },
      { address: tokenAccount, role: AccountRole.WRITABLE },
      { address: splInterface, role: AccountRole.WRITABLE },
      { address: tree, role: AccountRole.WRITABLE },
      { address: PROGRAMS.spp, role: AccountRole.READONLY },
      { address: PROGRAMS.token, role: AccountRole.READONLY },
      { address: PROGRAMS.system, role: AccountRole.READONLY },
    ],
    data: bytes(disc, amountBytes, getU8Encoder().encode(bump)),
  };
}

/**
 * Takes the SDK's withdrawal transaction and swaps its SPP `transact` for nyx's `withdraw_*`,
 * which CPIs that same transact: nyx's accounts, then SPP's accounts after its payer, with SPP's
 * data minus its one-byte tag as `transact_data`.
 */
export async function wrapWithdrawal(sdkTransaction: Transaction, asset: Asset, trader: Address) {
  const compiled = getCompiledTransactionMessageDecoder().decode(sdkTransaction.messageBytes);
  const message = decompileTransactionMessage(compiled as Parameters<typeof decompileTransactionMessage>[0]);
  const [config] = await pda(PROGRAMS.nyx, ["config"]);
  const disc = DISCRIMINATORS[`withdraw_${asset.key}`];

  return (message.instructions as readonly Instruction[]).map((ix): Instruction => {
    if (ix.programAddress !== PROGRAMS.spp || !ix.data || !ix.accounts) return ix;
    const transactData = ix.data.slice(1);
    return {
      programAddress: PROGRAMS.nyx,
      accounts: [
        { address: trader, role: AccountRole.WRITABLE_SIGNER },
        { address: config, role: AccountRole.READONLY },
        ...ix.accounts.slice(1),
      ],
      data: bytes(disc, getU32Encoder().encode(transactData.length), transactData),
    };
  });
}

/** A v1 transaction, the only kind SPP accepts. */
export function compileV1(
  feePayer: Address,
  instructions: Instruction[],
  lifetime: { blockhash: Blockhash; lastValidBlockHeight: bigint },
  kind: "deposit" | "withdraw",
) {
  return pipe(
    createTransactionMessage({ version: 1 }),
    (tx) => setTransactionMessageFeePayer(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(lifetime, tx),
    (tx) =>
      setTransactionMessageConfig(
        {
          computeUnitLimit: kind === "deposit" ? DEPOSIT_CU : WITHDRAW_CU,
          loadedAccountsDataSizeLimit: LOADED_ACCOUNTS_LIMIT,
        },
        tx,
      ),
    (tx) => appendTransactionMessageInstructions(instructions, tx),
    compileTransaction,
  );
}

/** Sends a signed transaction and waits for it. Returns its signature and slot. */
export async function sendTransaction(transaction: Transaction) {
  const zolana = await getClient();
  const signature = getSignatureFromTransaction(transaction as Parameters<typeof getSignatureFromTransaction>[0]);
  await zolana.solanaRpc
    .sendTransaction(getBase64EncodedWireTransaction(transaction as Parameters<typeof getBase64EncodedWireTransaction>[0]), {
      encoding: "base64",
    })
    .send();
  const slot = await zolana.confirmTransaction(signature);
  return { signature, slot };
}

/** Sends the wire bytes a wallet signed. */
export const sendSigned = (signed: Uint8Array) => sendTransaction(getTransactionDecoder().decode(signed));

/** What the wallet holds publicly of `asset`, in base units. */
export async function publicBalance(owner: Address, asset: Asset): Promise<bigint> {
  const zolana = await getClient();
  if (!asset.mint) return zolana.getBalance(owner);
  const [tokenAccount] = await findAssociatedTokenPda({ owner, mint: asset.mint, tokenProgram: PROGRAMS.token });
  try {
    const { value } = await zolana.solanaRpc.getTokenAccountBalance(tokenAccount).send();
    return BigInt(value.amount);
  } catch {
    return 0n;
  }
}
