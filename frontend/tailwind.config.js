/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand: Deep Navy
        navy: {
          50:  '#eef2ff',
          100: '#e0e8ff',
          200: '#c7d4fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#1a237e',  // Primary brand navy
          700: '#151b60',
          800: '#0f1347',
          900: '#080d2e',
          950: '#04071a',
        },
        // Accent: Gold
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // Primary gold
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Clause type colors (WCAG AA compliant)
        clause: {
          risk:       '#dc2626',   // Red — risk/warning
          obligation: '#1d4ed8',   // Blue — obligation
          deadline:   '#d97706',   // Amber — deadline
          financial:  '#16a34a',   // Green — financial
        },
        // Surfaces
        surface: {
          DEFAULT: '#0f172a',
          card:    '#1e293b',
          border:  '#334155',
          input:   '#1e293b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(251, 191, 36, 0.2)',
        'glow-lg': '0 0 40px rgba(251, 191, 36, 0.3)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #04071a 0%, #0f1347 50%, #151b60 100%)',
        'card-gradient': 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
        'gold-gradient': 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(251, 191, 36, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
