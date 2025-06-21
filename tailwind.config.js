/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',
        danger: '#ef4444',
        accent: '#38bdf8',
        secondary: {
          DEFAULT: 'rgba(255,255,255,0.6)',
          dark: 'rgba(30,41,59,0.6)',
        },
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
}
