/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // CSS-variable-backed brand palette — supports opacity modifiers (bg-brand-brown/10)
        brand: {
          brown:        'rgb(var(--brand-brown) / <alpha-value>)',
          'brown-dark': 'rgb(var(--brand-brown-dark) / <alpha-value>)',
          orange:       'rgb(var(--brand-orange) / <alpha-value>)',
          'orange-dark':'rgb(var(--brand-orange-dark) / <alpha-value>)',
          grey:         'rgb(var(--brand-grey) / <alpha-value>)',
          dark:         'rgb(var(--brand-dark) / <alpha-value>)',
          'grey-light': 'rgb(var(--brand-grey-light) / <alpha-value>)',
          'grey-dark':  'rgb(var(--brand-grey-dark) / <alpha-value>)',
        },
        // Semantic surface tokens (Phase 2 migration target)
        surface: {
          base:   'rgb(var(--surface-base) / <alpha-value>)',
          raised: 'rgb(var(--surface-raised) / <alpha-value>)',
          sunken: 'rgb(var(--surface-sunken) / <alpha-value>)',
        },
        ink: {
          DEFAULT:   'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          muted:     'rgb(var(--text-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      animation: {
        'fade-in':  'fadeIn 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideIn: { '0%': { transform: 'translateX(-20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
      },
      boxShadow: {
        card:        '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover':'0 8px 24px rgba(0,0,0,0.10)',
        float:       '0 4px 16px rgba(0,0,0,0.08)',
        glass:       'inset 0 1px 1px rgba(255,255,255,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
