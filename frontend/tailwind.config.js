/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0c1019',
        panel: '#121824',
        accent: '#8184ff',
      },
    },
  },
  plugins: [],
}
