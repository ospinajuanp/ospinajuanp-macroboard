/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-red-600',
    'bg-orange-500',
    'bg-yellow-400',
    'bg-green-500',
    'bg-green-600',
    'bg-cyan-500',
    'bg-blue-500',
    'bg-blue-600',
    'bg-purple-600',
    'bg-pink-500',
    'bg-gray-600',
    'bg-rose-500',
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
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
      animation: {
        shake: 'shake 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
};
