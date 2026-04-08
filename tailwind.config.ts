import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0f",
        surface: "#0f1117",
        "surface-2": "#161b27",
        border: "#1e2433",
        neon: "#00ff9f",
        "neon-dim": "#00cc7f",
        purple: "#8b5cf6",
        "purple-dim": "#6d28d9",
        text: "#f0f2f5",
        muted: "#6b7280",
      },
      fontFamily: {
        mono: ["'Courier New'", "Courier", "monospace"],
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
