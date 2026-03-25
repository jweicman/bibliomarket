/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-instrument)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        paper: {
          50: '#fdfaf5',
          100: '#f9f2e4',
          200: '#f2e4c8',
          300: '#e8d0a0',
          400: '#d9b574',
          500: '#c8954e',
          600: '#b07a38',
          700: '#8f612c',
          800: '#6e4a22',
          900: '#4e3318',
        },
        ink: {
          50: '#f5f3ee',
          100: '#e8e2d6',
          200: '#cfc3ae',
          300: '#b09f84',
          400: '#8f7c60',
          500: '#6e5c42',
          600: '#4e3e2c',
          700: '#342818',
          800: '#1e160c',
          900: '#0d0904',
        },
        forest: {
          50: '#eef4ee',
          100: '#cde4cd',
          200: '#9dc99d',
          300: '#6dae6d',
          400: '#4a9440',
          500: '#2d7a20',
          600: '#1e6015',
          700: '#12470c',
          800: '#092e06',
          900: '#041803',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffeecf',
          200: '#ffd99a',
          300: '#ffc063',
          400: '#ffa033',
          500: '#ff8110',
          600: '#f06005',
          700: '#c74408',
          800: '#9d330d',
          900: '#7d2b0f',
        },
      },
      backgroundImage: {
        'paper-texture': "url('/images/paper-texture.png')",
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'book': '4px 4px 0px 0px rgba(78, 51, 24, 0.15), 8px 8px 0px 0px rgba(78, 51, 24, 0.08)',
        'book-hover': '6px 6px 0px 0px rgba(78, 51, 24, 0.2), 12px 12px 0px 0px rgba(78, 51, 24, 0.10)',
        'card': '0 2px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-right': 'slideRight 0.3s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
