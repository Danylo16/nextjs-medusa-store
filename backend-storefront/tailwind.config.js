 /** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        soft: "0 10px 25px -10px rgba(0,0,0,0.15)",
      },
      colors: {
        brand: {
          DEFAULT: "#2563EB",
          accent: "#10B981",
          fg: "#F8FAFC",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
