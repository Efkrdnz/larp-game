/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#07090d', 900: '#0b0e14', 850: '#0f131b', 800: '#131823', 700: '#1b2230', 600: '#263042', 500: '#3a4659', 400: '#5d6b82', 300: '#8d99ad', 200: '#c3cbd8', 100: '#e7ebf2' },
        gold: { 400: '#f7cf5e', 500: '#f0b429', 600: '#c98f0c' },
        up: '#22c55e',
        down: '#ef4444',
        crime: { 500: '#dc2626', 900: '#1a0a0c' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
