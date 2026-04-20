/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
<<<<<<< HEAD
        sans: ["'DM Sans'", 'sans-serif'],
=======
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'], // Poppins devient la police par défaut
        dm: ['DM Sans', 'sans-serif'],                   // DM Sans reste disponible en option
>>>>>>> 95a80630d4f265bee20b2c4ad8927941e319003d
      },
      colors: {
        navy: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
      },
    },
  },
  plugins: [],
<<<<<<< HEAD
}
=======
}
>>>>>>> 95a80630d4f265bee20b2c4ad8927941e319003d
