/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7dbff',
          300: '#a0c4ff',
          400: '#71a3ff',
          500: '#437cff',
          600: '#265cf6',
          700: '#1b46e3',
          800: '#1d3bb7',
          900: '#1d3690',
          950: '#162358',
        },
        dark: {
          bg: '#0B0F19',
          card: '#111827',
          cardHover: '#1F2937',
          border: '#1F2937',
          borderLight: '#374151',
          text: '#F9FAFB',
          textMuted: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 20px -5px rgba(67, 124, 255, 0.4)',
      },
    },
  },
  plugins: [],
};
