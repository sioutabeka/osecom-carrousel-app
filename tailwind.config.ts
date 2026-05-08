import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./templates/**/*.{html,js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces & fonds
        bg: "#F7F5EB",          // crème principal
        cream: "#F7F5EB",
        "cream-soft": "#FFFDF8", // blanc chaud (cards)
        "cream-gold": "#F4EDC6", // section crème dorée (callouts)
        "border-beige": "#EFE6D0",

        // Encres / textes
        ink: "#3C2015",          // texte principal (alias historique)
        "ink-brown": "#3C2015",
        "ink-brown-soft": "#6B4A3A", // texte secondaire
        "ink-dark": "#2F180F",   // dark accent

        // Olive (CTA primaire / accents structurels)
        olive: {
          DEFAULT: "#828234",
          dark: "#6F6F2C",       // hover
        },

        // Bleu ciel (actions secondaires / nav)
        sky: {
          DEFAULT: "#BFD2EF",
          hover: "#A9C2E8",
        },

        // Rose (signature visuelle, highlights, badges)
        rose: {
          DEFAULT: "#EA609F",    // rose fort
          soft: "#E8A6B0",       // rose poudré
          light: "#FCC5DF",      // rose clair
        },

        // Compat avec quelques aliases utilisés ailleurs (pour ne rien casser)
        accent: "#EA609F",       // mappé sur rose fort
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        serif: ['"Fraunces"', "serif"],
        sans: ['"Public Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        accent: ['"Caveat"', "cursive"],
      },
      borderRadius: {
        xs: "8px",
        sm: "12px",
        md: "20px",
        lg: "24px",
        xl: "28px",
        "2xl": "32px",
      },
    },
  },
  plugins: [],
};

export default config;
