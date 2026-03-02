import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        obsidian: "#0A0A0A",
        "neon-cyan": "#00F3FF",
        "warm-amber": "#FF9D00",
        "crimson-risk": "#FF1F1F",
      },
      fontFamily: {
        bricolage: ["var(--font-bricolage)", "sans-serif"],
      },
      backdropBlur: {
        glass: "20px",
      },
    },
  },
  plugins: [],
};
export default config;
