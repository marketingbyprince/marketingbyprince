/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent:          '#FF6933',
        'accent-dark':   '#E8582A',
        'accent-muted':  '#FFF3EE',
        deep:            '#111827',
        charcoal:        '#1F2937',
        soft:            '#F9FAFB',
        'warn-canvas':   '#FFFBEB',
        'warn-border':   '#FCD34D',
      },
      fontFamily: {
        sans:    ['Raleway', 'system-ui', 'sans-serif'],
        raleway: ['var(--font-raleway)', 'sans-serif'],
      },
      fontSize: {
        display:        ['2.375rem', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        'pkg-title':    ['1.5rem',   { lineHeight: '1.3',  letterSpacing: '-0.01em' }],
        price:          ['1.625rem', { lineHeight: '1.2' }],
        'section-head': ['1.25rem',  { lineHeight: '1.4' }],
      },
      boxShadow: {
        card:           '0 1px 3px rgba(17,24,39,0.06), 0 1px 2px rgba(17,24,39,0.04)',
        'card-hover':   '0 4px 6px -1px rgba(17,24,39,0.1), 0 2px 4px rgba(17,24,39,0.06)',
        accent:         '0 4px 14px rgba(255,105,51,0.28)',
        'accent-lg':    '0 8px 25px rgba(255,105,51,0.35)',
      },
    },
  },
  plugins: [],
}
