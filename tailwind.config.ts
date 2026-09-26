import type { Config } from "tailwindcss";

// Impact Miami 2.0 — tokens lifted from the event flyer:
// near-black grid ground, off-white ink, green→cyan signal gradient,
// spaced mono labels over a heavy grotesk display face.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1200px" } },
    extend: {
      colors: {
        void: "#08090A", // page ground
        deck: "#0E1012", // raised panel
        rail: "#15181B", // inputs, hover fill
        line: "#23272B", // hairlines / borders
        "line-strong": "#343A40",
        ink: "#F2F1EC", // primary text (flyer off-white)
        dim: "#A3A9AE", // secondary text (≥4.5:1 on void)
        faint: "#6E757B", // tertiary labels, large/decorative only
        signal: "#3DEB8F", // green end of the gradient
        pulse: "#16D4F0", // cyan end of the gradient
        warn: "#F5B942",
        alert: "#FF6B6B",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"Geist"', "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: { kicker: "0.28em" },
      backgroundImage: {
        signal: "linear-gradient(90deg, #3DEB8F 0%, #16D4F0 100%)",
        "signal-diag": "linear-gradient(135deg, #3DEB8F 0%, #16D4F0 100%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(61,235,143,0.25), 0 8px 40px -12px rgba(22,212,240,0.35)",
      },
      keyframes: {
        blink: { "0%, 49%": { opacity: "1" }, "50%, 100%": { opacity: "0" } },
        rise: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        blink: "blink 1.1s steps(1) infinite",
        rise: "rise .5s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
