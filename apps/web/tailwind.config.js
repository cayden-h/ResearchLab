/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f5f1ea',
        surface: '#fffdf9',
        'surface-low': '#efebe4',
        'surface-muted': '#e4ddd2',
        primary: '#022448',
        secondary: '#006687',
        'secondary-soft': '#87d6fe',
        accent: '#b28752',
        ink: '#191c1d',
        muted: '#43474e',
        outline: '#c4c6cf',
        success: '#0f766e',
        warn: '#a16207',
        danger: '#b91c1c',
        midnight: '#091422',
      },
      fontFamily: {
        display: ['Newsreader', 'serif'],
        sans: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        ambient: '0 12px 40px rgba(2, 36, 72, 0.08)',
      },
      backgroundImage: {
        hero: 'linear-gradient(135deg, rgba(2,36,72,0.97) 0%, rgba(17,51,80,0.95) 56%, rgba(0,102,135,0.86) 100%)',
      },
    },
  },
  plugins: [],
};

