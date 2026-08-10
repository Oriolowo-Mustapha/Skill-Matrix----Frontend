/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mauve: {
          50: 'var(--color-mauve-50)',
          100: 'var(--color-mauve-100)',
          200: 'var(--color-mauve-200)',
          300: 'var(--color-mauve-300)',
          400: 'var(--color-mauve-400)',
          500: 'var(--color-mauve-500)',
          600: 'var(--color-mauve-600)',
          700: 'var(--color-mauve-700)',
          800: 'var(--color-mauve-800)',
          900: 'var(--color-mauve-900)',
          950: 'var(--color-mauve-950)',
        },
        matrix: {
          bg: 'var(--matrix-bg)',
          'bg-alt': 'var(--matrix-bg-alt)',
          surface: 'var(--matrix-surface)',
          'surface-hover': 'var(--matrix-surface-hover)',
          'surface-active': 'var(--matrix-surface-active)',
          primary: 'var(--matrix-primary)',
          'primary-hover': 'var(--matrix-primary-hover)',
          accent: 'var(--matrix-accent)',
          yellow: 'var(--matrix-yellow)',
          orange: 'var(--matrix-orange)',
          crimson: 'var(--matrix-crimson)',
          neon: 'var(--matrix-neon)',
          border: 'var(--matrix-border)',
          'border-hover': 'var(--matrix-border-hover)',
          'border-active': 'var(--matrix-border-active)',
          'text-primary': 'var(--matrix-text-primary)',
          'text-secondary': 'var(--matrix-text-secondary)',
          'text-muted': 'var(--matrix-text-muted)',
          xp: 'var(--matrix-xp)',
          mastery: 'var(--matrix-mastery)',
        },
        palette: {
          'ocean-blue': 'var(--palette-ocean-blue)',
          'soft-cream': 'var(--palette-soft-cream)',
          'gold-yellow': 'var(--palette-gold-yellow)',
          'burnt-orange': 'var(--palette-burnt-orange)',
          'deep-crimson': 'var(--palette-deep-crimson)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        flat: 'var(--shadow-flat)',
        'flat-hover': 'var(--shadow-flat-hover)',
        'flat-accent': 'var(--shadow-flat-accent)',
      }
    },
  },
  plugins: [],
}
