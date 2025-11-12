// Luxury Theme Components Configuration
export const luxuryComponents = {
  button: {
    base: "inline-flex items-center justify-center rounded-2xl text-sm font-semibold transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-105",
    variants: {
      default: "bg-gradient-luxury text-luxury-foreground shadow-2xl shadow-luxury/30 hover:shadow-3xl hover:shadow-luxury/50 border border-luxury/50 transform hover:scale-105",
      destructive: "bg-gradient-danger text-white shadow-2xl shadow-danger/30",
      outline: "border-2 border-luxury text-luxury bg-black/5 backdrop-blur-md hover:bg-luxury/5 hover:shadow-xl shadow-lg",
      secondary: "bg-gradient-premium text-white shadow-2xl shadow-premium/30 hover:shadow-3xl hover:shadow-premium/50",
      ghost: "text-luxury hover:bg-luxury/5 hover:text-luxury backdrop-blur-sm",
      link: "text-luxury underline-offset-4 hover:underline hover:text-luxury font-medium"
    },
    sizes: {
      default: "h-14 px-8 py-4 text-base",
      sm: "h-10 rounded-xl px-4 text-sm",
      lg: "h-16 rounded-3xl px-10 text-lg",
      icon: "h-12 w-12 rounded-xl"
    }
  },
  card: {
    base: "rounded-3xl border border-amber-200/40 bg-gradient-to-br from-white via-amber-50/30 to-yellow-50/30 backdrop-blur-md shadow-2xl shadow-amber-900/10 hover:shadow-3xl hover:shadow-amber-900/15 transition-all duration-500 hover:border-amber-300/50",
    header: "flex flex-col space-y-2 p-8",
    content: "p-8 pt-0",
    footer: "flex items-center p-8 pt-0"
  },
  input: {
    base: "flex h-14 w-full rounded-2xl border-2 border-amber-300/50 bg-white/80 backdrop-blur-md px-5 py-4 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-amber-600/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-500 shadow-inner"
  }
};