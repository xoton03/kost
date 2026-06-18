/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./flo.html",
    "./prices_flo.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff6d00",
        surface: "#141414",
        background: "#0A0A0A",
        outline: "#333333",
        "on-surface": "#ffffff",
        "on-surface-variant": "#a0a0a0",
        "primary-container": "#ff6d00",
        secondary: "#888888",
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
