/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Consolas', 'monospace'],
      },
      colors: {
        gold: {
          DEFAULT: '#E9A81E',
          50:  '#FDF8EA',
          100: '#FAEFC7',
          200: '#F5DC8A',
          300: '#EFC34D',
          400: '#E9A81E',
          500: '#C8891A',
          600: '#A36B15',
        },
        brown: {
          DEFAULT: '#241A0C',
          light: '#3B2A14',
          muted: '#8A7550',
          tan:   '#A8916A',
        },
        cream: {
          DEFAULT: '#FAF6EE',
          pure:    '#FFFDF7',
          tan:     '#FBE9C7',
          rose:    '#FBE9DC',
          warm:    '#EFE9DC',
        },
        success: {
          DEFAULT: '#2F6B3E',
          bg:      '#E7F1E9',
        },
        error: {
          DEFAULT: '#C4451F',
          dark:    '#8C2F14',
          bg:      '#FBECE7',
        },
        dark: {
          bg:   '#3B2A14',
          text: '#241A0C',
        },
      },
      screens: {
        'mobile': '402px',
      },
      maxWidth: {
        'mobile': '402px',
      },
      height: {
        'device': '874px',
      },
      borderRadius: {
        'ios': '44px',
      },
      boxShadow: {
        'ios-frame': '0 0 0 12px #1a1a1a, 0 0 0 14px #333, 0 30px 60px rgba(0,0,0,0.5)',
        'card': '0 1px 4px rgba(36,26,12,0.08)',
        'card-lg': '0 4px 16px rgba(36,26,12,0.14)',
      },
      animation: {
        'slide-up': 'slideUp 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-in',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
