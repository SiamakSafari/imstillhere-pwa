import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ─── Themed colors (driven by CSS vars in globals.css) ─── */
        // These classes automatically switch between dark & light mode
        th: {
          bg:          'var(--bg)',
          card:        'var(--bg-card)',
          'card-hover':'var(--bg-card-hover)',
          overlay:     'var(--bg-overlay)',
          modal:       'var(--bg-modal)',
          light:       'var(--bg-light)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          dark:    'var(--accent-dark)',
          darker:  'var(--accent-darker)',
          glow:    'var(--accent-glow)',
          subtle:  'var(--accent-subtle)',
        },
        // Themed grays — swap between dark and light palette
        gray: {
          50:  'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
        },
        // Semantic
        danger:  'var(--danger)',
        warning: 'var(--warning)',
        info:    'var(--info)',
        // Moods
        mood: {
          great: 'var(--mood-great)',
          good:  'var(--mood-good)',
          okay:  'var(--mood-okay)',
          low:   'var(--mood-low)',
          rough: 'var(--mood-rough)',
        },

        /* ─── Legacy / compat aliases ─── */
        // Keep these so old `dark-bg`, `dark-card` classes still work
        dark: {
          bg:          'var(--bg)',
          card:        'var(--bg-card)',
          'card-hover':'var(--bg-card-hover)',
          overlay:     'var(--bg-overlay)',
          modal:       'var(--bg-modal)',
          light:       'var(--bg-light)',
        },
      },
      textColor: {
        primary:   'var(--text-primary)',
        secondary: 'var(--text-secondary)',
      },
      borderColor: {
        card: 'var(--card-border)',
      },
      backgroundColor: {
        card: 'var(--bg-card)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'full': '9999px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 var(--accent-glow)' },
          '50%': { boxShadow: '0 0 40px 10px var(--accent-glow)' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'badge-pop': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'check-pop': 'check-pop 0.4s ease-out forwards',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'confetti-fall': 'confetti-fall 3s ease-out forwards',
        'badge-pop': 'badge-pop 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
