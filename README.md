# Nyx frontend

The web app for [Nyx](https://github.com/holps-7/nyx-exchange): move USDC, USDT and SOL into a private balance on Solana devnet, through the `nyx` program and Helius Privacy.

## Run it

```bash
cp .env.example .env.local   # add your Helius API key
npm install                  # also copies 2 wasm files Helius's SDK needs
npm run dev                  # http://localhost:3000
```

Changed `.env.local`? Restart `npm run dev`, then hard refresh the page (Cmd + Shift + R).

| Page | What it does |
|---|---|
| `/` | Landing page |
| `/vault` | Connect a wallet, unlock, deposit, withdraw |

## How it works

Helius Privacy only accepts **v1 transactions**, and wallets like Phantom can't sign them yet. So the wallet signs one message, and the app turns that signature into a **session key** that lives in the browser. The session key signs every v1 transaction. The wallet only sends funds to it, with normal transactions every wallet can sign.

```
  Wallet (Phantom)             Session key (browser)             Solana devnet
  ────────────────             ─────────────────────             ─────────────
1 Unlock    sign message ────▶ derive session + private keys
2 Activate  send 0.01 SOL ───▶ register private keys ──────────▶ Helius User Registry
3 Deposit   send funds ──────▶ nyx deposit_* (v1) ─────────────▶ nyx ─CPI─▶ SPP (private balance)
4 Withdraw  no popup           ZK proof + nyx withdraw_* (v1) ─▶ nyx ─CPI─▶ SPP ─▶ back to wallet
```

- **Unlock** and **Activate** happen once. Activate is only needed the first time.
- The same wallet always gives the same session key, so signing again brings your balance back.
- The session key is your nyx trader address, shown at the bottom of the balance card.

## How the code fits together

The UI follows atomic design: small pieces build bigger ones. All chain logic stays out of components.

```
app/  routes
 └─ templates/   PageShell: background, navbar, footer
     └─ organisms/   Hero, Features, Vault, VaultPanel, WalletModal …
         └─ molecules/   AmountInput, SegmentedTabs, WalletButton …
             └─ atoms/   Button, Card, Badge, AssetIcon …

VaultPanel ──▶ hooks/useVault.ts ──▶ lib/nyx.ts ──▶ Helius SDK + Solana RPC
 (screens)      (steps + state)       (keys, instructions, transactions)
```

## Folder structure

```
src/
├── app/                      Routes (Next.js App Router)
│   ├── layout.tsx            Fonts, providers, page shell
│   ├── page.tsx              Landing page
│   ├── vault/page.tsx        Vault page
│   └── globals.css           Tailwind setup and a few utilities
├── components/
│   ├── atoms/                Button, Card, Badge, Spinner, Logo, AssetIcon, Aurora (background)
│   ├── molecules/            AmountInput, SegmentedTabs, BalanceRow, FeatureCard, WalletButton, WalletOption
│   ├── organisms/            Navbar, Hero, Features, Footer, WalletModal, Vault, VaultPanel
│   └── templates/            PageShell: the layout every page sits in
├── constants/                One file per kind of setting
│   ├── colors.ts             Every color (Tailwind reads it through tailwind.config.ts)
│   ├── motion.ts             Animation timing and variants
│   ├── config.ts             Endpoints, program IDs, assets, instruction discriminators
│   └── content.ts            All page text
├── hooks/useVault.ts         Vault steps and state: unlock, activate, deposit, withdraw, sync
├── lib/
│   ├── nyx.ts                Session key, nyx instructions, building and sending transactions
│   ├── format.ts             Amount and address formatting
│   └── cn.ts                 Class name helper
└── providers/AppProviders.tsx   Wallet connection, wallet modal, reduced motion
```

## Where to change things

| To change… | Edit |
|---|---|
| Colors | `src/constants/colors.ts` |
| Text | `src/constants/content.ts` |
| Animations | `src/constants/motion.ts` |
| RPC, program IDs, tokens | `src/constants/config.ts` and `.env.local` |
| Deposit or withdraw logic | `src/lib/nyx.ts` and `src/hooks/useVault.ts` |

## Stack

Next.js 16, React 19, Tailwind CSS 4, Motion, `@solana/kit` 8, Wallet Standard, and Helius's `@heliuslabs/zolana` 0.4.0-alpha, which matches devnet's SPP. TypeScript is on 6 because ESLint doesn't support TypeScript 7 yet.

## Good to know

- **Devnet only.** `nyx`: `7KKuR3RDkgJYMzeoC2LFLEDY2NFh3BxxZd8LAYzaAQc2`, SPP: `sppU489D7A4U1exNo1oeMGZtLEofq3a6o2fR7UeoWB6`.
- **Tested on devnet:** SOL deposit and withdraw. USDC and USDT aren't tested yet.
- **The unlock signature is the key.** Anyone with it controls the private balance, so only sign it on Nyx.
- **`npm install` runs a `postinstall` step** that copies two wasm files into Helius's hasher package. Without them the build fails.
- **The Helius key is public.** Variables starting with `NEXT_PUBLIC_` end up in the browser, so use a devnet key.
