import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0c0d0f",
          900: "#121316",
          800: "#1a1b1f",
          700: "#24252b",
        },
        paper: "#e8e6e1",
        mute: "#8b8a86",
        gold: {
          DEFAULT: "#c4a574",
          dim: "#8a734c",
        },
        bid: "#3d9a7a",
        ask: "#c45c5c",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
