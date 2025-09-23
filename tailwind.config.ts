import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			// Enhanced Typography System
			fontFamily: {
				'arabic': ['Noto Sans Arabic', 'Arial', 'sans-serif'],
				'noto': ['Noto Sans Arabic', 'Arial', 'sans-serif'], // backward compatibility
				'display': ['Noto Sans Arabic', 'Inter', 'system-ui', 'sans-serif'],
				'body': ['Noto Sans Arabic', 'Inter', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }], 
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],
				'8xl': ['6rem', { lineHeight: '1' }],
				'9xl': ['8rem', { lineHeight: '1' }],
			},
			spacing: {
				'0.5': '0.125rem',
				'1.5': '0.375rem',
				'2.5': '0.625rem',
				'3.5': '0.875rem',
				'4.5': '1.125rem',
				'5.5': '1.375rem',
				'6.5': '1.625rem',
				'7.5': '1.875rem',
				'8.5': '2.125rem',
				'9.5': '2.375rem',
				'10.5': '2.625rem',
				'11': '2.75rem',
				'13': '3.25rem',
				'15': '3.75rem',
				'17': '4.25rem',
				'18': '4.5rem',
				'19': '4.75rem',
				'21': '5.25rem',
				'22': '5.5rem',
				'23': '5.75rem',
				'25': '6.25rem',
				'26': '6.5rem',
				'27': '6.75rem',
				'28': '7rem',
				'29': '7.25rem',
				'30': '7.5rem',
				'32': '8rem',
				'36': '9rem',
				'40': '10rem',
				'44': '11rem',
				'48': '12rem',
				'52': '13rem',
				'56': '14rem',
				'60': '15rem',
				'64': '16rem',
				'72': '18rem',
				'80': '20rem',
				'96': '24rem',
			},
			colors: {
				bg: 'var(--bg)',
				fg: 'var(--fg)',
				border: 'var(--border)',
				input: 'var(--muted)',
				ring: 'var(--primary)',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-fg)',
					fg: 'var(--primary-fg)',
					glow: 'var(--primary)',
					dark: 'color-mix(in srgb, var(--primary) 85%, #000 15%)'
				},
				'primary-fg': 'var(--primary-fg)',
				'primary-foreground': 'var(--primary-fg)',
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-fg)'
				},
				'secondary-fg': 'var(--secondary-fg)',
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-fg)'
				},
				'muted-fg': 'var(--muted-fg)',
				success: {
					DEFAULT: 'var(--success)'
				},
				warning: {
					DEFAULT: 'var(--warning)'
				},
				danger: {
					DEFAULT: 'var(--danger)'
				},
				info: {
					DEFAULT: 'var(--info)'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					glow: 'hsl(var(--accent-glow))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				luxury: {
					DEFAULT: 'hsl(var(--luxury))',
					foreground: 'hsl(var(--luxury-foreground))'
				},
				premium: {
					DEFAULT: 'hsl(var(--premium))',
					foreground: 'hsl(var(--premium-foreground))'
				},
				persian: {
					DEFAULT: 'hsl(var(--persian))',
					foreground: 'hsl(var(--persian-foreground))'
				},
				turquoise: {
					DEFAULT: 'hsl(var(--turquoise))',
					foreground: 'hsl(var(--turquoise-foreground))'
				},
				bronze: {
					DEFAULT: 'hsl(var(--bronze))',
					foreground: 'hsl(var(--bronze-foreground))'
				},
				olive: {
					DEFAULT: 'hsl(var(--olive))',
					foreground: 'hsl(var(--olive-foreground))'
				},
				coral: {
					DEFAULT: 'hsl(var(--coral))',
					foreground: 'hsl(var(--coral-foreground))'
				},
				pearl: {
					DEFAULT: 'hsl(var(--pearl))',
					foreground: 'hsl(var(--pearl-foreground))'
				},
				jasmine: {
					DEFAULT: 'hsl(var(--jasmine))',
					foreground: 'hsl(var(--jasmine-foreground))'
				},
				chat: {
					bg: 'hsl(var(--chat-bg))',
					sent: 'hsl(var(--chat-sent))',
					received: 'hsl(var(--chat-received))',
				},
				status: {
					online: 'hsl(var(--status-online))',
					offline: 'hsl(var(--status-offline))',
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-luxury': 'var(--gradient-luxury)',
				'gradient-premium': 'var(--gradient-premium)',
				'gradient-persian': 'var(--gradient-persian)',
				'gradient-commerce': 'var(--gradient-commerce)',
				'gradient-heritage': 'var(--gradient-heritage)',
				'gradient-persian-bg': 'var(--gradient-persian-bg)',
				'gradient-chat': 'var(--gradient-chat)',
				'gradient-landing': 'var(--gradient-landing)',
				'gradient-glass': 'var(--gradient-glass)',
			},
			boxShadow: {
				'card': 'var(--shadow-card)',
				'soft': 'var(--shadow-soft)',
				'glow': 'var(--shadow-glow)',
				'luxury': 'var(--shadow-luxury)',
				'glass': 'var(--shadow-glass)',
				'elegant': 'var(--shadow-elegant)',
				'persian': 'var(--shadow-persian)',
				'heritage': 'var(--shadow-heritage)',
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
			},
			borderRadius: {
				sm: 'var(--radius-sm)',
				md: 'var(--radius-md)',
				lg: 'var(--radius-lg)'
			},
			keyframes: {
				// Basic UI Animations
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-left': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-100%)' }
				},
				'slide-in-up': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'slide-out-down': {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(100%)' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.95)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 5px hsl(var(--primary))' },
					'50%': { boxShadow: '0 0 20px hsl(var(--primary))' }
				},
				// Persian Heritage Animations
				'persian-glow': {
					'0%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' },
					'50%': { boxShadow: '0 0 40px hsl(var(--primary) / 0.6)' },
					'100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' }
				},
				'persian-float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'persian-shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'heritage-wave': {
					'0%, 100%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(1deg)' },
					'75%': { transform: 'rotate(-1deg)' }
				},
				'arabesque-rotate': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
			},
			animation: {
				// Basic UI Animations
				'accordion-down': 'accordion-down 0.3s ease-out',
				'accordion-up': 'accordion-up 0.3s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-out-left': 'slide-out-left 0.3s ease-out',
				'slide-in-up': 'slide-in-up 0.3s ease-out',
				'slide-out-down': 'slide-out-down 0.3s ease-out',
				'bounce-in': 'bounce-in 0.6s ease-out',
				'shake': 'shake 0.5s ease-in-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				// Combined Animations
				'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
				'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out',
				// Persian Heritage Animations
				'persian-glow': 'persian-glow 4s ease-in-out infinite',
				'persian-float': 'persian-float 6s ease-in-out infinite',
				'persian-shimmer': 'persian-shimmer 3s linear infinite',
				'heritage-wave': 'heritage-wave 8s ease-in-out infinite',
				'arabesque-rotate': 'arabesque-rotate 20s linear infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
