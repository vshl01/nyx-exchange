import type { Config } from "tailwindcss";
import { colors } from "./src/constants/colors";

export default {
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace"],
        display: ["var(--font-display)", "ui-serif", "Georgia"],
      },
    },
  },
} satisfies Config;
