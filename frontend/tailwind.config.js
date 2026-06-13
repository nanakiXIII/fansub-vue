/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        bg: {
          0: 'rgb(var(--color-bg-0) / <alpha-value>)',
          1: 'rgb(var(--color-bg-1) / <alpha-value>)',
          2: 'rgb(var(--color-bg-2) / <alpha-value>)',
          3: 'rgb(var(--color-bg-3) / <alpha-value>)',
          4: 'rgb(var(--color-bg-4) / <alpha-value>)',
        },
        orange: {
          DEFAULT: 'rgb(var(--color-orange) / <alpha-value>)',
          hover:   'rgb(var(--color-orange-hover) / <alpha-value>)',
        },
        ink: {
          1: 'rgb(var(--color-ink-1) / <alpha-value>)',
          2: 'rgb(var(--color-ink-2) / <alpha-value>)',
          3: 'rgb(var(--color-ink-3) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
    },
  },
  plugins: [],
}
