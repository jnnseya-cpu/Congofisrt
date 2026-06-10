import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // DRC Flag colors: Sky Blue, Yellow, Red
        'drc-blue': '#007FFF',
        'drc-blue-light': '#3399FF',
        'drc-blue-dark': '#0055CC',
        'drc-yellow': '#FCD116',
        'drc-yellow-dark': '#E6B800',
        'drc-red': '#CE1126',
        // Keep green aliases pointing to blue for backward compat
        'drc-green': '#007FFF',
        'drc-green-light': '#3399FF',
        'drc-green-dark': '#0055CC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-drc': 'linear-gradient(135deg, #007FFF 0%, #0055CC 50%, #003399 100%)',
        // Actual DRC flag: sky blue bg with red diagonal stripe bordered by yellow
        'gradient-flag': 'linear-gradient(90deg, #007FFF 33%, #FCD116 33%, #FCD116 66%, #CE1126 66%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
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
      },
    },
  },
  plugins: [],
}

export default config
