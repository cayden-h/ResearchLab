/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f8f9fa',
        surface: '#ffffff',
        'surface-low': '#f3f4f5',
        'surface-muted': '#e8ecef',
        primary: '#022448',
        secondary: '#006687',
        'secondary-soft': '#87d6fe',
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
        hero: 'linear-gradient(135deg, rgba(2,36,72,0.98) 0%, rgba(30,58,95,0.94) 60%, rgba(0,102,135,0.82) 100%)',
      },
    },
  },
  plugins: [],
};

