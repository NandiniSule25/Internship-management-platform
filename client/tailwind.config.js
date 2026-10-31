/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        admin: {
          primary: '#8b5cf6', // Violet
          gradient: 'from-violet-600 to-indigo-600',
          badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        },
        mentor: {
          primary: '#10b981', // Emerald
          gradient: 'from-emerald-600 to-teal-600',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        },
        intern: {
          primary: '#f59e0b', // Amber
          gradient: 'from-amber-500 to-orange-600',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
      }
    },
  },
  plugins: [],
}
