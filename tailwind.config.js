/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D0326F', // Pink color for headers
        secondary: '#2A6B9C', // Blue color for buttons
        light: '#f8f9fa',
        dark: '#343a40',
      },
    },
  },
  plugins: [],
}