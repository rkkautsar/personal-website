import type { Config } from "tailwindcss"

import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-work-sans)', ...defaultTheme.fontFamily.sans],
        heading: ['var(--font-work-sans)', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        canvas: "#F0EDE9",
        ink: "#141414",
        primary: {
          600: "#FF7144",
          800: "#EB5728",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

