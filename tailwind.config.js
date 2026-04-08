/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1f2937', // Custom dark primary
          dark: '#111827',
          light: '#374151'
        },
        accent: {
          DEFAULT: '#f59e0b', // Amber/Yellow accent matching Kings College
          light: '#fcd34d'
        }
      }
    },
  },
  plugins: [],
}
