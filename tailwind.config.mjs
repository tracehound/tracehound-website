/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#121212',
        primary: '#00ff94', // Cyber Green
        secondary: '#00b8ff', // Cyber Blue
        accent: '#ff0055', // Cyber Red/Pink
        'surface-highlight': '#1E1E1E',
        text: '#e0e0e0',
        'text-muted': '#a0a0a0',
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
          'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00ff94, 0 0 10px #00ff94' },
          '100%': { boxShadow: '0 0 20px #00ff94, 0 0 40px #00ff94' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
