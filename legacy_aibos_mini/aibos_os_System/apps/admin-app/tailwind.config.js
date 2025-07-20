/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Luxury/Fintech specific colors
        neon: {
          green: '#00FF88',
          blue: '#00B3FF',
          pink: '#FF00AA',
          purple: '#8A2BE2',
          cyan: '#00FFFF',
          yellow: '#FFFF00',
        },
        // Apple's Signature Color Palette
        apple: {
          blue: '#007AFF',
          gray: {
            50: '#F2F2F7',
            100: '#E5E5EA',
            200: '#D1D1D6',
            300: '#C7C7CC',
            400: '#AEAEB2',
            500: '#8E8E93',
            600: '#636366',
            700: '#48484A',
            800: '#3A3A3C',
            900: '#2C2C2E',
            950: '#1C1C1E',
          },
        },
        // Glass effect colors (keep only this one)
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(28, 28, 30, 0.7)',
          border: 'rgba(255, 255, 255, 0.2)',
        },
        // Keep our existing neon colors
        'neon-green': '#00ff88',
        'neon-blue': '#00d4ff',
        'neon-pink': '#ff0080',
        'neon-purple': '#8b5cf6',
        'neon-yellow': '#fbbf24',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'apple-fade': 'appleFade 0.3s ease-out',
        'apple-slide': 'appleSlide 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
        'apple-scale': 'appleScale 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'apple-bounce': 'appleBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'glass-shimmer': 'glassShimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 5px #00FF88, 0 0 10px #00FF88, 0 0 15px #00FF88',
            textShadow: '0 0 5px #00FF88, 0 0 10px #00FF88'
          },
          '100%': { 
            boxShadow: '0 0 10px #00FF88, 0 0 20px #00FF88, 0 0 30px #00FF88',
            textShadow: '0 0 10px #00FF88, 0 0 20px #00FF88'
          },
        },
        appleFade: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        appleSlide: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        appleScale: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        appleBounce: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glassShimmer: {
          '0%, 100%': { backgroundPosition: '-200% 0' },
          '50%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.5)',
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 0, 128, 0.5)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'neon-yellow': '0 0 20px rgba(251, 191, 36, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'apple-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'apple-md': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'apple-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'apple-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      textShadow: {
        'neon-green': '0 0 5px #00FF88, 0 0 10px #00FF88',
        'neon-blue': '0 0 5px #00B3FF, 0 0 10px #00B3FF',
        'neon-pink': '0 0 5px #FF00AA, 0 0 10px #FF00AA',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        apple: '12px',
        'apple-lg': '16px',
        'apple-xl': '20px',
        'apple-2xl': '24px',
      },
      transitionTimingFunction: {
        'apple-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'apple-ease': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'apple-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'apple-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      screens: {
        xs: '375px',
        sm: '390px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.016em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.009em' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0.007em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0.005em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0.003em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '0.001em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.001em' }],
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.003em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.005em' }],
      },
      spacing: {
        '0.5': '0.125rem', // 2px
        '1': '0.25rem',    // 4px
        '1.5': '0.375rem', // 6px
        '2': '0.5rem',     // 8px
        '2.5': '0.625rem', // 10px
        '3': '0.75rem',    // 12px
        '3.5': '0.875rem', // 14px
        '4': '1rem',       // 16px
        '5': '1.25rem',    // 20px
        '6': '1.5rem',     // 24px
        '7': '1.75rem',    // 28px
        '8': '2rem',       // 32px
        '9': '2.25rem',    // 36px
        '10': '2.5rem',    // 40px
        '11': '2.75rem',   // 44px
        '12': '3rem',      // 48px
        '14': '3.5rem',    // 56px
        '16': '4rem',      // 64px
        '20': '5rem',      // 80px
        '24': '6rem',      // 96px
        '28': '7rem',      // 112px
        '32': '8rem',      // 128px
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // Custom Glass Effect Plugin
    function({ addUtilities, addComponents }) {
      addUtilities({
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(28, 28, 30, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      })
      
      addComponents({
        '.apple-button': {
          '@apply px-6 py-3 rounded-apple font-medium transition-all duration-200 ease-apple-smooth': {},
          '@apply bg-apple-blue text-white hover:bg-opacity-90 active:scale-95': {},
          '@apply shadow-apple hover:shadow-apple-md': {},
        },
        '.glass-panel': {
          '@apply glass rounded-apple-lg shadow-glass backdrop-blur-xl': {},
          '@apply border border-white/20 bg-white/10': {},
        },
        '.btn-apple': {
          '@apply inline-flex items-center justify-center rounded-apple px-6 py-3': {},
          '@apply text-sm font-medium transition-all duration-200 ease-apple-smooth': {},
          '@apply focus:outline-none focus:ring-2 focus:ring-offset-2': {},
          '@apply disabled:opacity-50 disabled:pointer-events-none': {},
        },
        '.btn-apple-primary': {
          '@apply btn-apple bg-apple-blue text-white': {},
          '@apply hover:bg-opacity-90 active:scale-95': {},
          '@apply shadow-apple hover:shadow-apple-md': {},
          '@apply focus:ring-apple-blue': {},
        },
        '.btn-apple-secondary': {
          '@apply btn-apple bg-apple-gray-100 text-apple-gray-900': {},
          '@apply hover:bg-apple-gray-200 active:scale-95': {},
          '@apply dark:bg-apple-gray-800 dark:text-apple-gray-100': {},
          '@apply dark:hover:bg-apple-gray-700': {},
        },
        '.glass-card': {
          '@apply glass rounded-apple-lg p-6': {},
          '@apply shadow-glass backdrop-blur-xl': {},
        },
        '.glass-navbar': {
          '@apply glass border-b border-white/20': {},
          '@apply backdrop-blur-2xl sticky top-0 z-50': {},
        },
      })
    }
  ],
} 