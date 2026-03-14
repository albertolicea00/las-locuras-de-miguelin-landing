/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF0055",
        secondary: "#111111",
        accent: "#00E5FF",
        dark: "#0A0A0A",
        "neon-yellow": "#FFD600",
        "neon-purple": "#E040FB",
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        body: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
