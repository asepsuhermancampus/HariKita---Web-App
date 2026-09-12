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
        hk: {
          canvas: "var(--hk-canvas)",
          ivory: "var(--hk-ivory)",
          "soft-beige": "var(--hk-soft-beige)",
          charcoal: "var(--hk-charcoal)",
          taupe: "var(--hk-taupe)",
          champagne: "var(--hk-champagne)",
        },
        canvas: "#FAF8F5",
        "canvas-subtle": "#F3EDE6",
        gold: {
          light: "#E3CAA5",
          DEFAULT: "#C5A880",
          dark: "#A3865E",
        },
        plum: {
          light: "#6B5E62",
          DEFAULT: "#4A2E35",
          dark: "#2A181D",
        },
      },
      fontFamily: {
        editorial: ["Cormorant Garamond", "Georgia", "serif"],
        manrope: ["Manrope", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Cinzel", "Georgia", "serif"],
        sans: ["Manrope", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        harikita: {
          primary: "#C5A880",
          secondary: "#4A2E35",
          accent: "#D4A89C",
          neutral: "#261F23",
          "base-100": "#FAF8F5",
          "base-200": "#F3EDE6",
          "base-300": "#E7DFD5",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
      "light",
    ],
    darkTheme: "harikita",
  },
};

export default config;
