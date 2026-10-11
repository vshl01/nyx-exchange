// The one place colors live. `tailwind.config.ts` turns these into classes like `bg-night-900`.

export const colors = {
  night: {
    950: "#05050A",
    900: "#09090F",
    850: "#0E0E17",
    800: "#13131F",
    700: "#1C1C2B",
    600: "#272739",
    500: "#363650",
  },
  moon: {
    50: "#F5F3FF",
    100: "#E9E6F7",
    200: "#C9C5DE",
    300: "#A6A2BE",
    400: "#85819E",
    500: "#67637F",
    600: "#4B4862",
  },
  aurora: {
    violet: "#8B5CF6",
    lilac: "#B79CFF",
    indigo: "#6366F1",
    cyan: "#3DE0F5",
    rose: "#F59BD6",
  },
  status: {
    success: "#3EE6A8",
    warning: "#FFC85C",
    danger: "#FF7A8A",
  },
  asset: {
    usdc: "#2775CA",
    usdt: "#26A17B",
    solFrom: "#9945FF",
    solTo: "#14F195",
  },
} as const;
