// The one place page copy lives.

export const content = {
  brand: "Nyx",
  tagline: "Private OTC on Solana",
  hero: {
    eyebrow: "Live on Solana devnet",
    title: ["Trade size", "in the dark."],
    body: "Move USDC, USDT and SOL into a private balance. Prices, sizes and bids never touch public order flow.",
    primary: "Open vault",
    secondary: "How it works",
  },
  features: [
    {
      icon: "shield",
      title: "Private balances",
      body: "Funds sit as encrypted UTXOs in Helius Privacy. Only you can see them.",
    },
    {
      icon: "swap",
      title: "RFQ offers",
      body: "Quote a single taker or many. Terms stay hidden behind a hash.",
      soon: true,
    },
    {
      icon: "gavel",
      title: "Sealed-bid auctions",
      body: "Bids are compared inside Arcium MPC. Only the winner is revealed.",
      soon: true,
    },
  ],
  steps: [
    { title: "Connect", body: "Any Solana wallet on devnet." },
    { title: "Unlock", body: "Sign once to create your Nyx session key." },
    { title: "Deposit", body: "Nyx moves funds into your private balance." },
    { title: "Withdraw", body: "Take funds out anytime. Never paused." },
  ],
  vault: {
    title: "Vault",
    body: "Your private balance, moved through Nyx.",
    connect: "Connect a wallet to start",
    unlock: "Unlock private balance",
    unlockHint: "Sign a message once. It creates your Nyx session key. No funds move.",
    register: "Activate your account",
    registerHint: "One time: your wallet sends 0.01 SOL to your session key, which then registers with Helius Privacy.",
    session: "Session key",
  },
  footer: "Built on Helius Privacy and Arcium. Devnet only.",
} as const;
