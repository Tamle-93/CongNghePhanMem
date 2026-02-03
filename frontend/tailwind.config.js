/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // UTH Green Theme Colors
        'primary': '#166534',       // green-800 - Màu xanh lá đậm UTH
        'primary-dark': '#14532d',  // green-900 - Xanh đậm hơn
        'primary-light': '#22c55e', // green-500 - Nhạt hơn
        'background-light': '#f6f7f8',
        'background-dark': '#101922',
        'surface-light': '#ffffff',
        'surface-dark': '#1a2632',
        'border-light': '#e7edf3',
        'border-dark': '#2a3b4c',
        'text-main-light': '#0d141b',
        'text-main-dark': '#e0e6ed',
        'text-sub-light': '#4c739a',
        'text-sub-dark': '#94a3b8',
      },
      fontFamily: {
        'sans': ['Be Vietnam Pro', 'Inter', 'system-ui', 'sans-serif'],
        'display': ['Be Vietnam Pro', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
      },
      animation: {
        'fade-in-down': 'fadeInDown 0.3s ease-out',
      },
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}