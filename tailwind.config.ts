import type { Config } from "tailwindcss";

// Theme colours live in CSS variables as hex, which Tailwind can't add alpha to.
// color-mix makes opacity modifiers such as bg-night/85 work.
const v = (name: string) =>
  `color-mix(in srgb, var(--${name}) calc(<alpha-value> * 100%), transparent)`;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/providers/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Night-stadium ground and panels, taken from the SCL logo
        night: {
          DEFAULT: v("night"),
          2: v("night-2"),
          3: v("night-3"),
        },
        rule: {
          DEFAULT: v("rule"),
          strong: v("rule-strong"),
        },
        ink: {
          DEFAULT: v("ink"),
          2: v("ink-2"),
          3: v("ink-3"),
        },
        floodlight: v("floodlight"),
        "floodlight-strong": v("floodlight-strong"),
        violet: v("violet"),
        ball: v("ball"),
        turf: v("turf"),
        ribbon: v("ribbon"),
        cream: v("cream"),
        cat: {
          legend: v("cat-legend"),
          youngstar: v("cat-youngstar"),
          gold: v("cat-gold"),
          silver: v("cat-silver"),
          bronze: v("cat-bronze"),
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        condensed: ["var(--font-condensed)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "4px",
        md: "6px",
        lg: "10px",
      },
      keyframes: {
        "stamp-in": {
          "0%": { opacity: "0", transform: "scale(1.9) rotate(-14deg)", filter: "blur(6px)" },
          "60%": { opacity: "1", transform: "scale(0.94) rotate(-8deg)", filter: "blur(0)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-8deg)" },
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ink-settle": {
          "0%, 30%": { backgroundColor: "var(--settle-from)" },
          "100%": { backgroundColor: "var(--settle-to)" },
        },
      },
      animation: {
        "stamp-in": "stamp-in 520ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "rise-in": "rise-in 600ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "toast-in": "toast-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "ink-settle": "ink-settle 3s cubic-bezier(0.33, 1, 0.68, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
