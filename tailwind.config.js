/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pink: {
          50: "#fff0f7",
          100: "#ffe3f1",
          200: "#ffc6e3",
          300: "#ff98cb",
          400: "#ff59a9",
          500: "#f6339a", // 你的專屬主色調
          600: "#df1379",
          700: "#bc0960",
        },
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans TC", "sans-serif"],
      },
    },
    variants: {},
    plugins: [],
    corePlugins: {
      preflight: false,
    },
  },
};
