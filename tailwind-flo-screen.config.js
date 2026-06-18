/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./flo_screen.html"
  ],
  theme: {
    extend: {
      colors: {
        "secondary-fixed-dim": "#c6c6c7",
        "tertiary-fixed-dim": "#c7c6c6",
        "tertiary-fixed": "#e3e2e2",
        "outline-variant": "#594136",
        "surface-variant": "#41312a",
        "surface-container-low": "#261812",
        "primary": "#ffb692",
        "secondary-fixed": "#e2e2e2",
        "surface-container-highest": "#41312a",
        "secondary": "#c6c6c7",
        "on-primary": "#562000",
        "surface-tint": "#ffb692",
        "inverse-surface": "#f7ddd2",
        "primary-container": "#ff6d00",
        "surface-container-high": "#362720",
        "on-error-container": "#ffdad6",
        "background": "#0A0A0A",
        "surface-bright": "#46362e",
        "on-background": "#f7ddd2",
        "on-secondary-fixed-variant": "#454747",
        "on-primary-container": "#582100",
        "outline": "#333333",
        "on-tertiary": "#2f3131",
        "error-container": "#93000a",
        "surface-dim": "#1d100a",
        "tertiary": "#c7c6c6",
        "on-primary-fixed": "#341100",
        "on-secondary-container": "#b4b5b5",
        "on-tertiary-fixed-variant": "#464747",
        "primary-fixed-dim": "#ffb692",
        "inverse-primary": "#9f4200",
        "on-tertiary-container": "#313232",
        "surface": "#1A1A1A",
        "on-primary-fixed-variant": "#7a3000",
        "on-surface": "#f7ddd2",
        "on-secondary": "#2f3131",
        "error": "#ffb4ab",
        "surface-container-lowest": "#170b06",
        "on-error": "#690005",
        "secondary-container": "#454747",
        "primary-fixed": "#ffdbcb",
        "tertiary-container": "#9a9a9a",
        "on-tertiary-fixed": "#1a1c1c",
        "on-surface-variant": "#e2bfb0",
        "inverse-on-surface": "#3d2d26",
        "surface-container": "#2a1c16",
        "on-secondary-fixed": "#1a1c1c"
      },
      borderRadius: {
        DEFAULT: "0px",
        lg: "0px",
        xl: "0px",
        full: "0px"
      },
      spacing: {
        "margin-desktop": "32px",
        "margin-mobile": "16px",
        "unit": "4px",
        "sidebar-width": "240px",
        "gutter": "16px"
      },
      fontFamily: {
        "body-main": ["Inter"],
        "body-mono": ["JetBrains Mono"],
        "headline-md-mobile": ["Space Grotesk"],
        "label-caps": ["Space Grotesk"],
        "headline-md": ["Space Grotesk"],
        "display-lg": ["Space Grotesk"]
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
