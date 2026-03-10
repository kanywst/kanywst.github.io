import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00f0ff',
        'neon-pink': '#ff006e',
        'neon-purple': '#9d4edd',
        'neon-blue': '#4361ee',
        'neon-green': '#06ffa5',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #00f0ff 0%, #9d4edd 50%, #ff006e 100%)',
        'gradient-dark': 'linear-gradient(to bottom right, #0a0e27 0%, #1a1a3e 50%, #0f0f2e 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { textShadow: '0 0 10px #00f0ff, 0 0 20px #9d4edd' },
          '50%': { textShadow: '0 0 20px #00f0ff, 0 0 30px #9d4edd' },
        },
        shimmer: {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(157, 78, 221, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5)',
      },
    },
  },
  plugins: [],
} satisfies Config;

