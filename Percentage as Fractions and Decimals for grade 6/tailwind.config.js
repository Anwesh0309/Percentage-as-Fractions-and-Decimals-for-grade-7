/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          bg: "#0C061E",
          card: "#161129",
          cardHover: "#1F183D",
          border: "#3B2D6B",
          gold: "#FFB800",
          goldHover: "#E6A600",
          green: "#10B981",
          pink: "#F43F5E",
          cyan: "#06B6D4",
          purple: "#8B5CF6",
          text: "#F3F4F6",
          textMuted: "#9CA3AF",
        }
      },
      fontFamily: {
        display: ['Fredoka One', 'Fredoka', 'cursive', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(255, 184, 0, 0.4)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'float': 'float 3s infinite ease-in-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(255, 184, 0, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 184, 0, 0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
