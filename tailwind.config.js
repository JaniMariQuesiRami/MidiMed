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
        primary: '#3abdd4',
        danger: '#ff3564',
        secondary: {
          DEFAULT: '#f9f9f9',
          dark: '#1a1a1a',
        },
      },
    },
  },
  plugins: [],
}
