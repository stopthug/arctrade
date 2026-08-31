import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F7F5",
        muted: "#5F5F5F",
        wash: "#EFEFE9",
        line: {
          DEFAULT: "#D9D9D5",
          soft: "#E8E8E4",
        },
        navy: {
          DEFAULT: "#07101F",
          mid: "#0C1A33",
        },
        arcblue: {
          DEFAULT: "#1A53E8",
          deep: "#0E3BB8",
          soft: "#DBE6FF",
        },
        ink: {
          DEFAULT: "#0A0A0A",
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
