import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-dark': '#2563EB',
        'secondary-soft': '#DBEAFE',
        'aqua-soft': '#E0F2FE',
        'green-soft': '#DDEFD8',
        'blue-soft': '#DCEBFF',
        'red-soft': '#F9DCDD',
        'blue-main': '#4F8FCE',
        'red-main': '#D97A7F',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'text-main': '#24434A',
        'text-muted': '#5E7B80',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
