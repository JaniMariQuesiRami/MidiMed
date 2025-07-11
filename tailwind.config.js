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
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
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
