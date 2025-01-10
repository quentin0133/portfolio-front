/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "selector",
  content: [
    "./src/**/*.{html,js,ts}",
    'node_modules/preline/dist/*.js',
  ],
  theme: {
    extend: {
      animation: {
        'skeleton-reflection': 'skeletonReflection 3.5s ease-in-out infinite'
      },
      keyframes: {
        skeletonReflection: {
          '0%': {
            backgroundPosition: '0% 0%',
            backgroundSize: '200% 400%'
          },
          '100%': {
            backgroundPosition: '100% 100%',
            backgroundSize: '200% 400%'
          },
        },
      },
    },
  },
  plugins: [
    require('preline/plugin'),
  ],
}

