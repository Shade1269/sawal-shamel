export const ferrariComponents = {
  button: {
    base: "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.01]",
    variants: {
      default: "bg-gradient-danger text-white shadow-lg shadow-danger/25 hover:shadow-xl hover:shadow-danger/35 border border-danger/20",
      destructive: "bg-gradient-danger text-white shadow-lg shadow-danger/25 hover:shadow-xl hover:shadow-danger/35 brightness-90",
      outline: "border-2 border-danger/80 text-danger bg-slate-900/80 backdrop-blur-sm hover:bg-danger/5 hover:border-danger",
      secondary: "bg-gradient-muted text-slate-200 shadow-lg shadow-muted/20 hover:shadow-xl hover:shadow-muted/30 border border-muted/20",
      ghost: "text-danger hover:bg-danger/5 hover:text-danger transition-all duration-300",
      link: "text-danger underline-offset-4 hover:underline hover:text-danger font-medium"
    },
    sizes: {
      default: "h-12 px-8 py-3.5 text-base",
      sm: "h-10 rounded-lg px-5 text-sm",
      lg: "h-16 rounded-2xl px-12 text-lg",
      icon: "h-12 w-12 rounded-lg"
    }
  },
  card: {
    base: "rounded-2xl border border-red-600/15 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 backdrop-blur-sm shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-red-600/15 hover:border-red-600/25 transition-all duration-500",
    header: "flex flex-col space-y-3 p-8",
    content: "p-8 pt-0",
    footer: "flex items-center p-8 pt-0"
  },
  input: {
    base: "flex h-12 w-full rounded-xl border-2 border-slate-700/50 bg-slate-900/95 backdrop-blur-sm px-5 py-3.5 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:border-red-600/50 focus-visible:shadow-lg focus-visible:shadow-red-600/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-500"
  }
};
