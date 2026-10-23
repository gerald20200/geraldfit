/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        ink: '#09090b',
        panel: '#18181b',
        line: '#27272a',
        acid: '#22d3ee',
        mint: '#67e8f9',
      },
    },
  },
  plugins: [],
}