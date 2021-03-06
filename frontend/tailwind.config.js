/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */

module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './context/**/*.{js,jsx,ts,tsx}',
  ],
  // defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
  darkMode: 'media', // 'media' or 'class'
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      'md-lg': '875px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1806px',
    },
    extend: {
      spacing: {
        maxwi: '311px',
      },
      colors: {
        primary: {
          100: '#787878',
          200: '#5E5E5E',
          300: '#454545',
          400: '#2B2B2B',
          500: '#121212',
        },
        secondary: {
          100: '#DCFEEA',
          200: '#AAFDCD',
          300: '#79FCAF',
          400: '#47FA92',
          500: '#15F974',
        },
        figma: {
          100: '#4E4E4E',
          200: '#0F2026',
          300: '#C9D9E1',
          400: '#F1F8FB',
          500: '#D94A3D',
        },
      },
      backgroundImage: {
        'bg-1': 'url("/bg.png")',
        'bg-ticket': 'url("/ticket.png")',
        'bg-event': 'url("/event.jpg")',
      },
      animation: {
        tilt: 'tilt 5s infinite linear',
      },
      keyframes: {
        tilt: {
          '0%, 50%, 100%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(2deg)',
          },
          '75%': {
            transform: 'rotate(-2deg)',
          },
          '100%': {
            transform: 'rotate(0deg)',
          },
        },
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
