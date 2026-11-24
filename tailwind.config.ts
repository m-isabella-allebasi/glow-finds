import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pearl: '#FAF8F6',
        burgundy: {
          DEFAULT: '#7E0B3B',
          hover: '#5E072B',
        },
        blush: {
          DEFAULT: '#F9A8C9',
          soft: '#FDF2F7',
        },
        noir: '#0D0D0D',
        muted: '#52525B',
        subtle: '#EAE4E6',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        script: ['var(--font-meow)', 'cursive'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        editorial: '0 8px 30px -12px rgba(126, 11, 59, 0.08)',
        card: '0 2px 16px -4px rgba(13, 13, 13, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
