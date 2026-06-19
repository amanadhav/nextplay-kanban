import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "hsl(var(--background))",
          elevated: "hsl(var(--background-elevated))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          hover: "hsl(var(--card-hover))",
        },
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        foreground: "hsl(var(--foreground))",
        accent: {
          DEFAULT: "hsl(var(--accent))",
          hover: "hsl(var(--accent-hover))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96) translateY(4px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "scale-out": {
          from: { opacity: "1", transform: "scale(1) translateY(0)" },
          to: { opacity: "0", transform: "scale(0.96) translateY(4px)" },
        },
        toast: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "10%": { opacity: "1", transform: "translateY(0)" },
          "90%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(8px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "fade-out": "fade-out 150ms ease-in forwards",
        "scale-in": "scale-in 160ms ease-out",
        "scale-out": "scale-out 140ms ease-in forwards",
        toast: "toast 3s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
