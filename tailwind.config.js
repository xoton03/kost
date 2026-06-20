/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./explorer.html",
    "./station.html",
    "./tictache.html",
    "./ticticket.html",
    "./history.html",
    "./js/**/*.js",
    "./app.js",
    "./navigation.js",
    "./sync.js",
    "./updater.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
