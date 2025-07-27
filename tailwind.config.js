const colors = require('tailwindcss/colors');

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // blue-600
        secondary: '#a21caf', // purple-700
        accent: '#3b82f6',   // blue-500
      }
    }
  },
  corePlugins: {
    preflight: true,
  }
}; 