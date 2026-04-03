/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx,ts,tsx}",      // Explicitly checking pages
    "./src/components/**/*.{js,jsx,ts,tsx}", // Explicitly checking components
    "./src/context/**/*.{js,jsx,ts,tsx}",    // Explicitly checking context
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#18181b',
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}