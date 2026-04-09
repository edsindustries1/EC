/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4f9',
          100: '#dfe8f3',
          200: '#c7d7eb',
          300: '#a8bfdf',
          400: '#7a9ad1',
          500: '#5a7ac1',
          600: '#3b5ba7',
          700: '#2d4a7a',
          800: '#1a365d',
          900: '#0f1f3d',
        },
        secondary: {
          50: '#f3f5fb',
          100: '#e6eaf6',
          200: '#cbd4f0',
          300: '#a8bde6',
          400: '#7a9ad1',
          500: '#5a7ac1',
          600: '#3b5ba7',
          700: '#2d4a7a',
          800: '#1f3557',
          900: '#142340',
        },
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 8px rgba(26, 54, 93, 0.08)',
        'card-hover': '0 10px 25px rgba(26, 54, 93, 0.15)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
