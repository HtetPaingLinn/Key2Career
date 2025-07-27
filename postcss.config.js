module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    'postcss-preset-env': {
      features: {
        'color-functional-notation': false,
        'oklab': false,
        'oklch': false
      }
    }
  },
}; 