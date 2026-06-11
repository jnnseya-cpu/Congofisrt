import type { Config } from 'tailwindcss';

/**
 * VERYX Design System tokens.
 * Brand: deep navy canvas with gold accents (per Blueprint §9.2).
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef1f8',
          100: '#d6dcec',
          200: '#aab6d6',
          300: '#7587b9',
          400: '#4a5d96',
          500: '#2f4078',
          600: '#22305f',
          700: '#1a2650',
          800: '#121a3a',
          900: '#0b1228',
          950: '#060a18',
        },
        gold: {
          50: '#fdf8ec',
          100: '#f8ecc9',
          200: '#f0d68f',
          300: '#e7bd55',
          400: '#dfa629',
          500: '#c98a16',
          600: '#a96a11',
          700: '#864c12',
          800: '#6f3d15',
          900: '#5f3416',
        },
        veryx: {
          bg: '#060a18',
          panel: '#0b1228',
          card: '#121a3a',
          border: '#1f2a4d',
          muted: '#7587b9',
        },
        status: {
          ok: '#22c55e',
          warn: '#f59e0b',
          high: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(223,166,41,0.25), 0 0 24px -6px rgba(223,166,41,0.35)',
      },
      backgroundImage: {
        'veryx-radial':
          'radial-gradient(1200px 600px at 70% -10%, rgba(223,166,41,0.10), transparent 60%), radial-gradient(900px 500px at 0% 0%, rgba(47,64,120,0.35), transparent 55%)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
