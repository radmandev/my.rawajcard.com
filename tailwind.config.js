/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
			cyan: {
				50: '#ECFEFF',
				100: '#CFFAFE',
				200: '#A5F3FC',
				300: '#67E8F9',
				400: '#38BDF8',
				500: '#22A6F0',
				600: '#0284C7',
				700: '#0369A1',
				800: '#075985',
				900: '#0C4A6E'
			},
			blue: {
				50: '#F5F3FF',
				100: '#EDE9FE',
				200: '#DDD6FE',
				300: '#C4B5FD',
				400: '#A78BFA',
				500: '#E879F9',
				600: '#D946EF',
				700: '#A21CAF',
				800: '#701A75',
				900: '#4C1D95'
			},
			indigo: {
				50: '#FFFFFF',
				100: '#F8FAFC',
				200: '#E2E8F0',
				300: '#CBD5F5',
				400: '#818CF8',
				500: '#6366F1',
				600: '#4F46E5',
				700: '#4338CA',
				800: '#1E1B4B',
				900: '#0C1429',
				950: '#070B1A'
			},
			slate: {
				50: '#FFFFFF',
				100: '#F1F5F9',
				200: '#E2E8F0',
				300: '#CBD5E1',
				400: '#94A3B8',
				500: '#64748B',
				600: '#475569',
				700: '#334155',
				800: '#1E293B',
				900: '#0C1429'
			},
			purple: {
				50: '#FDF4FF',
				100: '#FAE8FF',
				200: '#F5D0FE',
				300: '#F0ABFC',
				400: '#E879F9',
				500: '#E879F9',
				600: '#E879F9',
				700: '#E879F9',
				800: '#701A75',
				900: '#4C1D95'
			},
			fuchsia: {
				50: '#FDF4FF',
				100: '#FAE8FF',
				200: '#F5D0FE',
				300: '#F0ABFC',
				400: '#E879F9',
				500: '#38BDF8',
				600: '#38BDF8',
				700: '#A21CAF',
				800: '#86198F',
				900: '#701A75'
			},
			magenta: {
				400: '#F472B6',
				500: '#EC4899',
				600: '#E879F9',
				700: '#BE185D'
			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
		},
		backgroundImage: {
			'gradient-to-r': 'linear-gradient(135deg, var(--tw-gradient-from) 0%, var(--tw-gradient-from) 48%, var(--tw-gradient-to) 100%)'
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}