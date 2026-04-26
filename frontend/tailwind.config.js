/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F1F8F5',
          100: '#D4EDDA',
          200: '#A8D5BA',
          300: '#7CBD9F',
          400: '#4CAF50',
          500: '#2E7D32',
          600: '#245F2A',
          700: '#1A4722',
          800: '#102F1A',
          900: '#081812',
        },
        secondary: {
          50: '#F8F9F7',
          100: '#E8F5E9',
          200: '#C8E6C9',
          300: '#A5D6A7',
          400: '#81C784',
          500: '#66BB6A',
          600: '#4CAF50',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
        accent: {
          50: '#FFFDE7',
          100: '#FFF9C4',
          200: '#FFF59D',
          300: '#FFF176',
          400: '#FFEE58',
          500: '#FFEB3B',
          600: '#FDD835',
          700: '#FBC02D',
          800: '#F9A825',
          900: '#F57F17',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        error: '#D32F2F',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'card': '0 4px 15px 0 rgba(46, 125, 50, 0.1)',
        'card-lg': '0 10px 30px 0 rgba(46, 125, 50, 0.15)',
        'hover': '0 10px 40px 0 rgba(46, 125, 50, 0.2)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
        'gradient-accent': 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
        'gradient-warm': 'linear-gradient(135deg, #FFF9C4 0%, #FFE082 100%)',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.8' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backdropBlur: {
        glass: '10px',
      },
      transitionDuration: {
        '350': '350ms',
      },
    },
  },
  plugins: [],
}
