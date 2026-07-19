import type { Config } from 'tailwindcss'

// Tokens sourced from skills/design-system/SKILL.md (Legal Contract Review Platform).
// Tailwind's default spacing scale (1=4px, 2=8px, 4=16px, 6=24px, 8=32px, 10=40px, 12=48px)
// already matches the design system's 4px-grid spacing tokens exactly, so it is left
// un-overridden. Border radius likewise maps onto Tailwind defaults: rounded (4px) for
// badges/tags, rounded-md (6px) for buttons/toolbars, rounded-lg (8px) for inputs,
// rounded-xl (12px) for cards/modals.
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#112E81', hover: '#0E276E' },
        secondary: { DEFAULT: '#4647AE', hover: '#3B3C96' },
        accent: { DEFAULT: '#AACCD6', light: '#D8E8ED' },
        surface: {
          bg: '#FFFFFF',
          subtle: '#F8FAFC',
          DEFAULT: '#F1F5F9',
          elevated: '#FFFFFF',
        },
        border: { DEFAULT: '#E2E8F0', strong: '#CBD5E1' },
        content: { primary: '#0F172A', secondary: '#475569', muted: '#64748B' },
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
        info: '#0284C7',
        status: {
          completed: '#16A34A',
          processing: '#F59E0B',
          failed: '#DC2626',
          draft: '#64748B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        display: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        h1: ['28px', { lineHeight: '36px', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        h3: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        h4: ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        body: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        small: ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-out',
      },
    },
  },
  plugins: [],
}

export default config
