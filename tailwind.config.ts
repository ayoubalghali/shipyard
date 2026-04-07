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
        // Dark Backgrounds
        "pure-black": "#000000",
        "dark-navy": "#0A0E27",
        elevated: "#1A2332",
        interactive: "#2A3A4E",
        // Brand Colors
        "primary-blue": "#2563EB",
        "accent-cyan": "#00D9FF",
        // Status Colors
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        // Text Colors
        "text-primary": "#FFFFFF",
        "text-secondary": "#A3A3A3",
        "text-tertiary": "#6B7280",
        "text-disabled": "#4B5563",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["'Fira Code'", "'Courier New'", "monospace"],
      },
      borderRadius: {
        card: "8px",
        button: "6px",
      },
      boxShadow: {
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.3)",
        "cyan-glow": "0 0 16px rgba(0, 217, 255, 0.15)",
        "input-focus": "0 0 0 3px rgba(0, 217, 255, 0.1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUpFade: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 150ms ease-in-out",
        "slide-up-fade": "slideUpFade 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
