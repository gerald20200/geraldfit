/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { turf: '#10B981', pitch: '#0F172A', locker: '#1E293B', gold: '#F59E0B', light: '#F8FAFC', muted: '#94A3B8' },
    fontFamily: { display: ['Barlow Condensed', 'sans-serif'], sans: ['DM Sans', 'sans-serif'] },
  } },
  plugins: [],
};