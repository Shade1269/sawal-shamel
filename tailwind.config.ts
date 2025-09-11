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
			fontFamily: {
				'cairo': ['Cairo', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					glow: 'hsl(var(--primary-glow))',
					dark: 'hsl(var(--primary-dark))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
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
				atlantis: {
					DEFAULT: 'hsl(var(--atlantis))',
					foreground: 'hsl(var(--atlantis-foreground))'
				},
				coral: {
					DEFAULT: 'hsl(var(--coral))',
					foreground: 'hsl(var(--coral-foreground))'
				},
				pearl: {
					DEFAULT: 'hsl(var(--pearl))',
					foreground: 'hsl(var(--pearl-foreground))'
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
				'gradient-atlantis': 'var(--gradient-atlantis)',
				'gradient-commerce': 'var(--gradient-commerce)',
				'gradient-ocean': 'var(--gradient-ocean)',
				'gradient-atlantis-bg': 'var(--gradient-atlantis-bg)',
				'gradient-chat': 'var(--gradient-chat)',
				'gradient-landing': 'var(--gradient-landing)',
				'gradient-glass': 'var(--gradient-glass)',
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'glow': 'var(--shadow-glow)',
				'luxury': 'var(--shadow-luxury)',
				'glass': 'var(--shadow-glass)',
				'elegant': 'var(--shadow-elegant)',
				'atlantis': 'var(--shadow-atlantis)',
				'ocean': 'var(--shadow-ocean)',
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				'accordion-up': 'accordion-up 0.2s ease-out',
				'atlantis-glow': 'atlantisGlow 8s ease-in-out infinite alternate',
				'atlantis-float': 'atlantisFloat 4s ease-in-out infinite',
				'atlantis-shimmer': 'atlantisShimmer 3s linear infinite',
				'ocean-wave': 'oceanWave 6s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
