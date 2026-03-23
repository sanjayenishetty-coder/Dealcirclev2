import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        dc: {
          bg: "#0A0F1E",
          surface: "#111827",
          raised: "#1A2235",
          border: "#1E2D45",
          gold: "#C8992A",
          "gold-hover": "#E0AE3A",
          "text-primary": "#F1F5F9",
          "text-secondary": "#94A3B8",
          "text-muted": "#4B5563",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          startup: "#3B82F6",
          sme: "#6366F1",
          debt: "#F59E0B",
        },
      },
      fontFamily: {
        display: ["Instrument Serif", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
