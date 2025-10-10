export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(20,184,166,.25),transparent)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-semibold leading-tight">
            تسوّق بذكاء، اربح أكثر.
          </h1>
          <p className="mt-4 text-muted-foreground">
            منصة تجارة متكاملة للمسوّقين والمتاجر. واجهة فاخرة، أداء عالي، وتجربة
            مخصصة.
          </p>
          <div className="mt-8 flex gap-3">
            <a
              href="/store"
              className="btn-primary rounded-xl px-5 py-3"
            >
              تسوّق الآن
            </a>
            <a
              href="/alliances"
              className="rounded-xl px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10"
            >
              اكتشف التحالفات
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
