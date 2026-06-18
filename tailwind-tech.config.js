/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./technical_fiche.html"
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#1d100a",
        "on-secondary-fixed-variant": "#454747",
        "surface-variant": "#41312a",
        "surface-bright": "#46362e",
        "surface-tint": "#ffb692",
        "surface-container": "#2a1c16",
        "surface-container-high": "#362720",
        "secondary": "#c6c6c7",
        "on-tertiary": "#2f3131",
        "on-primary": "#562000",
        "on-primary-container": "#582100",
        "primary-fixed": "#ffdbcb",
        "outline": "#a98a7c",
        "error": "#ffb4ab",
        "surface-container-lowest": "#170b06",
        "background": "#1d100a",
        "on-error": "#690005",
        "tertiary-container": "#9a9a9a",
        "surface-dim": "#1d100a",
        "inverse-primary": "#9f4200",
        "on-tertiary-fixed-variant": "#464747",
        "tertiary-fixed-dim": "#c7c6c6",
        "on-secondary-container": "#b4b5b5",
        "primary-container": "#ff6d00",
        "secondary-container": "#454747",
        "on-tertiary-fixed": "#1a1c1c",
        "inverse-surface": "#f7ddd2",
        "error-container": "#93000a",
        "on-primary-fixed": "#341100",
        "inverse-on-surface": "#3d2d26",
        "secondary-fixed-dim": "#c6c6c7",
        "surface-container-highest": "#41312a",
        "on-secondary": "#2f3131",
        "outline-variant": "#594136",
        "on-surface-variant": "#e2bfb0",
        "on-surface": "#f7ddd2",
        "tertiary-fixed": "#e3e2e2",
        "primary": "#ffb692",
        "on-primary-fixed-variant": "#7a3000",
        "secondary-fixed": "#e2e2e2",
        "primary-fixed-dim": "#ffb692",
        "surface-container-low": "#261812",
        "on-error-container": "#ffdad6",
        "on-tertiary-container": "#313232",
        "on-secondary-fixed": "#1a1c1c",
        "on-background": "#f7ddd2",
        "tertiary": "#c7c6c6"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "sidebar-width": "240px",
        "margin-desktop": "32px",
        "unit": "4px",
        "margin-mobile": "16px",
        "gutter": "16px"
      },
      fontFamily: {
        "headline-md-mobile": ["Space Grotesk"],
        "label-caps": ["Space Grotesk"],
        "display-lg": ["Space Grotesk"],
        "body-main": ["Inter"],
        "body-mono": ["JetBrains Mono"],
        "headline-md": ["Space Grotesk"]
      },
      fontSize: {
        "headline-md-mobile": ["20px", {"lineHeight": "1.2", "letterSpacing": "0.08em", "fontWeight": "600"}],
        "label-caps": ["12px", {"lineHeight": "1.0", "letterSpacing": "0.15em", "fontWeight": "500"}],
        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "0.05em", "fontWeight": "700"}],
        "body-main": ["14px", {"lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "400"}],
        "body-mono": ["13px", {"lineHeight": "1.4", "letterSpacing": "-0.02em", "fontWeight": "400"}],
        "headline-md": ["24px", {"lineHeight": "1.2", "letterSpacing": "0.08em", "fontWeight": "600"}]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
