import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Safelist: clases que se usan dinámicamente y Tailwind podría eliminar
  safelist: [
    // Layout
    'flex', 'flex-1', 'flex-col', 'flex-wrap', 'flex-shrink-0',
    'grid', 'items-center', 'items-start', 'justify-between', 'justify-end', 'justify-center',
    // Spacing
    'gap-1', 'gap-1.5', 'gap-2', 'gap-2.5', 'gap-3', 'gap-3.5', 'gap-4',
    'p-4', 'px-2', 'px-3', 'px-4', 'py-1', 'py-2', 'py-2.5', 'py-10',
    'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mt-1', 'mt-2', 'mt-4', 'ml-auto',
    // Sizing
    'w-full', 'h-full', 'min-h-screen', 'min-w-0',
    'w-2', 'h-2', 'w-7', 'h-7', 'w-8', 'h-8', 'w-9', 'w-64',
    // Text
    'text-center', 'text-right', 'text-left',
    'font-medium', 'font-light', 'font-sans',
    'leading-none', 'leading-tight', 'leading-snug', 'leading-relaxed',
    'whitespace-nowrap', 'truncate', 'overflow-hidden', 'text-ellipsis',
    // Borders & radius
    'rounded', 'rounded-full', 'rounded-lg',
    'border', 'border-b', 'border-t', 'border-r',
    'border-0', 'border-none',
    // Display
    'hidden', 'block', 'inline-block', 'relative', 'absolute', 'sticky',
    'overflow-x-auto', 'overflow-hidden',
    'top-0', 'top-full', 'left-0', 'right-0',
    'z-40', 'z-50',
    // Transitions
    'transition-all', 'duration-150', 'duration-500',
    // Opacity
    'opacity-40',
    // Cursor
    'cursor-pointer', 'cursor-not-allowed',
    // Select
    'select-none',
    // Grid cols (las más usadas)
    'grid-cols-2', 'grid-cols-3', 'grid-cols-5', 'grid-cols-6',
    'col-span-2',
    // Animate
    'animate-pulse',
    // Space
    'space-y-2', 'space-y-4',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
