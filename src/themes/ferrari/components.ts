export const ferrariComponents = {
  button: {
    base: "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.02]",
    variants: {
      default: "bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white shadow-2xl shadow-red-600/40 hover:shadow-[0_0_32px_rgba(196,30,58,0.6),0_0_64px_rgba(196,30,58,0.3)] hover:from-red-600 hover:to-red-600 border border-red-500/30",
      destructive: "bg-gradient-to-r from-red-800 to-red-900 text-white shadow-2xl shadow-red-800/35 hover:shadow-3xl hover:shadow-red-800/50",
      outline: "border-2 border-red-600 text-red-600 bg-slate-900/50 backdrop-blur-md hover:bg-red-950/30 hover:shadow-[0_0_24px_rgba(196,30,58,0.4)]",
      secondary: "bg-gradient-to-r from-slate-700 to-slate-800 text-slate-200 shadow-2xl shadow-slate-700/30 hover:shadow-3xl hover:shadow-slate-700/45 border border-slate-600/30",
      ghost: "text-red-500 hover:bg-red-950/20 hover:text-red-400 backdrop-blur-sm transition-all duration-300",
      link: "text-red-500 underline-offset-4 hover:underline hover:text-red-400 font-medium"
    },
    sizes: {
      default: "h-12 px-7 py-3.5 text-base",
      sm: "h-10 rounded-lg px-4 text-sm",
      lg: "h-16 rounded-2xl px-10 text-lg",
      icon: "h-12 w-12 rounded-lg"
    }
  },
  card: {
    base: "rounded-2xl border border-red-600/20 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_12px_48px_rgba(196,30,58,0.25),0_0_24px_rgba(196,30,58,0.15)] hover:border-red-600/35 transition-all duration-500",
    header: "flex flex-col space-y-2.5 p-7",
    content: "p-7 pt-0",
    footer: "flex items-center p-7 pt-0"
  },
  input: {
    base: "flex h-12 w-full rounded-xl border-2 border-slate-700/60 bg-slate-900/80 backdrop-blur-md px-5 py-3.5 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:border-red-600/60 focus-visible:shadow-[0_0_24px_rgba(196,30,58,0.3)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-500"
  }
};
