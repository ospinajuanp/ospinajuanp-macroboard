/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-red-600',
    'bg-orange-600',
    'bg-yellow-500',
    'bg-green-600',
    'bg-teal-600',
    'bg-blue-600',
    'bg-indigo-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-gray-600',
  ],
  theme: {
    extend: {
      colors: {
        deckstream: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          dark: '#0f172a',
          darker: '#020617',
        },
      },
    },
  },
  plugins: [],
};
