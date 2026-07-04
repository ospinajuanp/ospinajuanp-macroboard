/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './out/**/*.{html,js}',
  ],
  theme: {
    extend: {
      colors: {
        'deckstream-dark': '#0f172a',
        'deckstream-primary': '#6366f1',
        'deckstream-secondary': '#8b5cf6',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
