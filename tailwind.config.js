/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          500: '#1767d1',
          600: '#1155b4',
          700: '#10468f',
          950: '#09244d',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, .05), 0 16px 30px rgba(15, 23, 42, .04)',
      },
    },
  },
  plugins: [],
}
