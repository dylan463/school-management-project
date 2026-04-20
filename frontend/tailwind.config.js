/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
<<<<<<< HEAD
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'], // Poppins devient la police par défaut
        dm: ['DM Sans', 'sans-serif'],                   // DM Sans reste disponible en option
=======
        sans: ["'DM Sans'", 'sans-serif'],
>>>>>>> 48f443108b5c8fe935880c201f85ac819895b3a2
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
>>>>>>> 48f443108b5c8fe935880c201f85ac819895b3a2
