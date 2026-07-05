/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'macroboard-dark': '#0f172a',
        'macroboard-primary': '#6366f1',
        'macroboard-secondary': '#8b5cf6',
        'macroboard-accent': '#ec4899',
      },
    },
  },
  plugins: [],
};
