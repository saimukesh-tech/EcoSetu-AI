/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        // Semantic tokens — consume CSS variables so light/dark stay centralized.
        background: 'rgb(var(--color-background) / <alpha-value>)',
        'background-subtle': 'rgb(var(--color-background-subtle) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--color-surface-elevated) / <alpha-value>)',
        'surface-sunken': 'rgb(var(--color-surface-sunken) / <alpha-value>)',

        'brand-primary': 'rgb(var(--color-brand-primary) / <alpha-value>)',
        'brand-primary-hover': 'rgb(var(--color-brand-primary-hover) / <alpha-value>)',
        'brand-secondary': 'rgb(var(--color-brand-secondary) / <alpha-value>)',
        'brand-accent': 'rgb(var(--color-brand-accent) / <alpha-value>)',
        'brand-accent-strong': 'rgb(var(--color-brand-accent-strong) / <alpha-value>)',
        'brand-forest': 'rgb(var(--color-brand-forest) / <alpha-value>)',

        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        'text-on-brand': 'rgb(var(--color-text-on-brand) / <alpha-value>)',

        border: 'rgb(var(--color-border) / <alpha-value>)',
        'border-subtle': 'rgb(var(--color-border-subtle) / <alpha-value>)',
        'border-strong': 'rgb(var(--color-border-strong) / <alpha-value>)',

        success: 'rgb(var(--color-success) / <alpha-value>)',
        'success-subtle': 'rgb(var(--color-success-subtle) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        'warning-subtle': 'rgb(var(--color-warning-subtle) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        'error-subtle': 'rgb(var(--color-error-subtle) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        'info-subtle': 'rgb(var(--color-info-subtle) / <alpha-value>)',

        // Fixed brand scale (for gradients / illustrations where a literal step is needed)
        forest: {
          950: '#0B2417', 900: '#0F2E1D', 800: '#153B25', 700: '#1E4A30',
          600: '#26592F', 500: '#2F6B31', 400: '#3F7A2C',
        },
        leaf: {
          700: '#3F7A2C', 600: '#548F2E', 500: '#6B9C2F', 400: '#7EAE35', 300: '#8DBB3A', 200: '#AACD63', 100: '#D3E7AE',
        },
        gold: {
          700: '#C7841A', 600: '#DC9720', 500: '#EDA82A', 400: '#F2B84C', 300: '#F4C15C', 200: '#F8D791', 100: '#FCEDC9',
        },
        cream: {
          DEFAULT: '#FBF7EE', deep: '#F3ECDC', white: '#FFFDF8',
        },
        charcoal: {
          DEFAULT: '#182018', 800: '#1E271E', 700: '#26312A',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        // Editorial serif reserved for marketing-scale headline moments (landing hero,
        // auth side panels, onboarding) — never for dense in-app UI, which stays on
        // the sans family for legibility and information density.
        'display-serif': ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        caption: ['0.75rem', { lineHeight: '1.4' }],
        label: ['0.8125rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        body: ['0.9375rem', { lineHeight: '1.65' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.65' }],
        h4: ['1.25rem', { lineHeight: '1.35', fontWeight: '700', letterSpacing: '-0.01em' }],
        h3: ['1.5rem', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.012em' }],
        h2: ['1.875rem', { lineHeight: '1.25', fontWeight: '800', letterSpacing: '-0.015em' }],
        h1: ['2.5rem', { lineHeight: '1.15', fontWeight: '800', letterSpacing: '-0.02em' }],
        display: ['3.25rem', { lineHeight: '1.08', fontWeight: '800', letterSpacing: '-0.025em' }],
      },
      spacing: {
        4.5: '1.125rem',
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '28px',
        '3xl': '36px',
        organic: '42% 58% 61% 39% / 45% 40% 60% 55%',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 34 20 / 0.04), 0 1px 1px rgb(15 34 20 / 0.03)',
        natural: '0 4px 16px -4px rgb(15 34 20 / 0.08), 0 2px 6px -2px rgb(15 34 20 / 0.05)',
        elevated: '0 12px 32px -8px rgb(15 34 20 / 0.14), 0 4px 12px -4px rgb(15 34 20 / 0.08)',
        'focus-ring': '0 0 0 3px rgb(var(--color-brand-primary) / 0.35)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, rgb(var(--color-brand-forest)) 0%, rgb(var(--color-brand-primary)) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #EDA82A 0%, #F4C15C 100%)',
      },
      transitionDuration: {
        120: '120ms', 180: '180ms', 240: '240ms', 320: '320ms',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: 0, transform: 'scale(0.97)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        'slide-in-left': { '0%': { opacity: 0, transform: 'translateX(-16px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'pulse-soft': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.55 } },
        'flow-dash': { to: { strokeDashoffset: -24 } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-up': 'fade-up 320ms ease-out both',
        'scale-in': 'scale-in 180ms ease-out both',
        'slide-in-left': 'slide-in-left 220ms cubic-bezier(0.4, 0, 0.2, 1) both',
        'fade-in': 'fade-in 180ms ease-out both',
        'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
        'flow-dash': 'flow-dash 1.2s linear infinite',
        'spin-slow': 'spin-slow 6s linear infinite',
      },
    },
  },
  plugins: [],
}
