import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './content/**/*.{js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b0b10',
        surface: '#14141c',
        elevated: '#1b1b26',
        paper: '#f3f1eb',
        muted: '#aaa8b2',
        violet: '#8b5cf6',
        magenta: '#ec4899',
        cyan: '#1a73e8',
      },
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
}
