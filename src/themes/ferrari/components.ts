export const ferrariComponents = {
  button: {
    base: "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.01]",
    variants: {
      default: "bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/35 hover:from-red-600 hover:to-red-600 border border-red-500/20",
      destructive: "bg-gradient-to-r from-red-800 to-red-900 text-white shadow-lg shadow-red-800/25 hover:shadow-xl hover:shadow-red-800/35",
      outline: "border-2 border-red-600/80 text-red-600 bg-slate-900/80 backdrop-blur-sm hover:bg-red-950/20 hover:border-red-600",
      secondary: "bg-gradient-to-r from-slate-700 to-slate-800 text-slate-200 shadow-lg shadow-slate-700/20 hover:shadow-xl hover:shadow-slate-700/30 border border-slate-600/20",
      ghost: "text-red-500 hover:bg-red-950/15 hover:text-red-400 transition-all duration-300",
      link: "text-red-500 underline-offset-4 hover:underline hover:text-red-400 font-medium"
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
