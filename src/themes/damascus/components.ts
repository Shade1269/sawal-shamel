// Damascus Theme Components Configuration
export const damascusComponents = {
  button: {
    base: "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variants: {
      default: "bg-gradient-persian text-white shadow-lg shadow-persian/25 hover:shadow-xl hover:shadow-persian/40 transform hover:scale-105",
      destructive: "bg-gradient-danger text-white shadow-lg shadow-danger/25 hover:shadow-xl hover:shadow-danger/40",
      outline: "border-2 border-persian text-persian bg-white/50 backdrop-blur-sm hover:bg-persian/5 hover:shadow-lg",
      secondary: "bg-gradient-premium text-white shadow-lg shadow-premium/25 hover:shadow-xl hover:shadow-premium/40",
      ghost: "text-persian hover:bg-persian/5 hover:text-persian",
      link: "text-persian underline-offset-4 hover:underline hover:text-persian"
    },
    sizes: {
      default: "h-12 px-6 py-3",
      sm: "h-9 rounded-md px-3 text-xs",
      lg: "h-14 rounded-xl px-8 text-base",
      icon: "h-10 w-10"
    }
  },
  card: {
    base: "rounded-2xl border border-slate-300/30 bg-white/80 backdrop-blur-sm shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-slate-900/10 transition-all duration-300",
    header: "flex flex-col space-y-1.5 p-6",
    content: "p-6 pt-0",
    footer: "flex items-center p-6 pt-0"
  },
  input: {
    base: "flex h-12 w-full rounded-xl border-2 border-slate-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:border-teal-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
  }
};