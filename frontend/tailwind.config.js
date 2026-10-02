/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          50: "#F4F7F4",
          100: "#E3EBE3",
          200: "#C6D7C7",
          300: "#9EBEA0",
          400: "#72A075",
          500: "#4D8251",
          600: "#39673C",
          700: "#2B4F2E",
          800: "#1F3B21",
          900: "#132715",
          950: "#09150B",
        },
        parchment: {
          50: "#FCFDF9",
          100: "#F6F7F0",
          200: "#ECEFE4",
          300: "#DFE4D4",
          400: "#C8D0B9",
          500: "#A9B494",
        },
        earth: {
          dark: "#1A251D",
          deep: "#0F1A12",
          card: "#162319",
          border: "#293D2E",
        },
        ochre: {
          500: "#D97706",
          600: "#B45309",
        }
      },
      fontFamily: {
        serif: ["Merriweather", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      }
    },
  },
  plugins: [],
}
