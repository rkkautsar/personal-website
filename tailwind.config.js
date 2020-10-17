const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Work Sans", ...defaultTheme.fontFamily.sans],
        heading: ["Space Mono", ...defaultTheme.fontFamily.mono],
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
  variants: {},
  plugins: [],
};
