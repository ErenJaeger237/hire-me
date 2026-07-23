/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#004ac6',
        'on-primary': '#ffffff',
        surface: '#F8FAFC',
        'surface-bright': '#faf8ff',
        'on-surface': '#191b23',
        'surface-container': '#F1F5F9',
        'surface-container-high': '#e7e7f3',
        'surface-container-highest': '#CBD5E1',
        outline: '#E2E8F0',
        'outline-variant': '#c3c6d7',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
