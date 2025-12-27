/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#080808', // Darker, sharper black
        surface: '#111111', // Very subtle lift
        primary: '#F2C94C', // Technical Amber (replacing neon green)
        secondary: '#3b82f6', // Sharp Professional Blue
        accent: '#F2994A', // Orange accent
        'surface-highlight': '#222222', // High contrast border color
        text: '#eaeaea',
        'text-muted': '#888888',
      },
      fontFamily: {
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
        sans: [
          '"Inter"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(to right, #222 1px, transparent 1px), linear-gradient(to bottom, #222 1px, transparent 1px)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #F2C94C, 0 0 10px #F2C94C' },
          '100%': { boxShadow: '0 0 20px #F2C94C, 0 0 40px #F2C94C' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
