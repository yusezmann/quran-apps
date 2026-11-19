import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "15px",
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1200px",
    },
    fontFamily: {
      primary: ["var(--font-poppins)"],
      secondary: ["var(--font-reem-kufi)"],
      tertiary: ["var(--font-amiri)"],
    },
    extend: {
      colors: {
        primary: "#1c1c22",
        accent: {
          DEFAULT: "#00ff99",
          hover: "#00e187",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Game "Belajar" anak
        "float-up": {
          from: { top: "100%" },
          to: { top: "-40%" },
        },
        sway: {
          "0%, 100%": { transform: "translateX(-6px) rotate(-3deg)" },
          "50%": { transform: "translateX(6px) rotate(3deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%, 60%": { transform: "rotate(-10deg)" },
          "40%, 80%": { transform: "rotate(10deg)" },
        },
        pop: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.35)", opacity: "0.8" },
          "100%": { transform: "scale(0)", opacity: "0" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.9" },
          "50%": { opacity: "0.35" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-up": "float-up 10s linear infinite",
        twinkle: "twinkle 3.2s ease-in-out infinite",
        sway: "sway 2.4s ease-in-out infinite",
        wiggle: "wiggle 0.5s ease-in-out",
        pop: "pop 0.35s ease-out forwards",
        "bounce-in": "bounce-in 0.5s ease-out both",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
