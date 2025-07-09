/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "warning-low": "#FACC15",     // kuning
        "warning-medium": "#FB923C",  // oranye
        "warning-high": "#DC2626",    // merah
      }
    },
  },
  plugins: [],
}

