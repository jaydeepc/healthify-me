/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Piramal Finance theme colors
        primary: {
          light: '#FF8F50', // Light orange
          DEFAULT: '#f26841', // Piramal orange
          dark: '#E5560F', // Dark orange
        },
        secondary: {
          light: '#6D6D6D',
          DEFAULT: '#404040', // Dark gray
          dark: '#1A1A1A',
        },
        accent: {
          light: '#FFD580', // Light gold
          DEFAULT: '#FFB740', // Gold
          dark: '#E5A53E',
        },
        success: {
          light: '#58D68D',
          DEFAULT: '#2ecc71',
          dark: '#25A25A',
        },
        error: {
          light: '#EC7063',
          DEFAULT: '#e74c3c',
          dark: '#B93D30',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
