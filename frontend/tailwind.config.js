/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Keep this for dark mode toggling
  content: [
    "./index.html", // For your root HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all JS, TS, JSX, TSX files in the src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}