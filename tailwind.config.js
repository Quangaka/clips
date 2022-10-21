/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      opacity: ['disable'],
      backgroundColor: ['disable'],
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio")
  ],
}
