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
        canvas: {
          100: "#141026",
          300:  "#211a3b",
          500:  "#2c224f",
        },
        ink: {
          400: "#ffffff",
          600: "#efefef",
          700: "#e0e0e0"
        },
        primary: {
          600: "#FF7144",
          800: "#EB5728",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

