/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        transitionProperty: {
          'width': 'width',
          'margin': 'margin',
        },
        animation: {
          'slide-in': 'slideIn 0.3s ease-in-out',
          'slide-out': 'slideOut 0.3s ease-in-out',
        },
        keyframes: {
          slideIn: {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(0)' },
          },
          slideOut: {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-100%)' },
          },
        },
      },
    },
    plugins: [],
  }