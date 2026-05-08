/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8e6f5e",
          dark: "#6b5346",
          light: "#b8a59a",
        },
        secondary: {
          DEFAULT: "#d4c3b3",
          light: "#f5f0f0",
        },
        dark: "#000000",
        light: "#ecf0f1",
      },
    },
  },
  plugins: [],
};
