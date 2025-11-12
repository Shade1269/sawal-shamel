export const ferrariComponents = {
  button: {
    base: "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.01]",
    variants: {
      default: "bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:brightness-110 border border-primary/20",
      destructive: "bg-destructive text-destructive-foreground shadow-lg hover:shadow-xl hover:brightness-110 border border-destructive/20",
      outline: "border-2 border-border text-foreground bg-background/80 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:border-primary",
      secondary: "bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl hover:brightness-105 border border-border/20",
      ghost: "text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300",
      link: "text-primary underline-offset-4 hover:underline hover:brightness-110 font-medium"
    },
    sizes: {
      default: "h-12 px-8 py-3.5 text-base",
      sm: "h-10 rounded-lg px-5 text-sm",
      lg: "h-16 rounded-2xl px-12 text-lg",
      icon: "h-12 w-12 rounded-lg"
    }
  },
  card: {
    base: "rounded-2xl border border-border bg-card backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-500",
    header: "flex flex-col space-y-3 p-8",
    content: "p-8 pt-0",
    footer: "flex items-center p-8 pt-0"
  },
  input: {
    base: "flex h-12 w-full rounded-xl border-2 border-border bg-input backdrop-blur-sm px-5 py-3.5 text-base text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary focus-visible:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-500"
  }
};
