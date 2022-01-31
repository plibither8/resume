const defaults = require("tailwindcss/defaultConfig");

module.exports = {
  content: ["./index.html"],
  theme: {
    fontFamily: {
      sans: ["Inter", ...defaults.theme.fontFamily.sans],
    },
    extend: {},
  },
  plugins: [],
};
