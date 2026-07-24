/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette — carried over from the admin dashboard's dark/lime-green identity
        brand: {
          lime: {
            50: "#f4ffe4",
            100: "#e5ffc2",
            200: "#cdff8f",
            300: "#a8f550",
            400: "#8ee62b",
            500: "#7ac917", // primary action color
            600: "#5fa010",
            700: "#487a10",
            800: "#3a6013",
            900: "#325214",
          },
          dark: {
            50: "#f4f6f4",
            100: "#e2e6e2",
            200: "#c5cbc5",
            300: "#9aa39a",
            400: "#66716a",
            500: "#3f4a42",
            700: "#1c211d",
            800: "#141813",
            900: "#0a0d0a",
            950: "#050605",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "check-pop": {
          "0%": { transform: "scale(0)" },
          "60%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
        "slide-up": "slide-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "check-pop": "check-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        shimmer: "shimmer 1.8s linear infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
