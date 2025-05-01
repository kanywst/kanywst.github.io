/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kubernetes: 'var(--kubernetes)',
        security: 'var(--security)',
        cloud: 'var(--cloud)',
        architecture: 'var(--architecture)',
        devops: 'var(--devops)',
      },
      animation: {
        'spin-slow': 'spin-slow 20s linear infinite',
      },
    },
  },
  plugins: [],
  darkMode: 'media',
}
