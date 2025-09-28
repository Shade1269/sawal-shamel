import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

export default function ResetCache() {
  const [status, setStatus] = useState<string>("جاري تنفيذ التنظيف...");

  useEffect(() => {
    const run = async () => {
      try {
        // Unregister all service workers
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
        }

        // Clear caches
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }

        // Clear storage (safe subset)
        try { localStorage.clear(); } catch {}
        try { sessionStorage.clear(); } catch {}
        try {
          // Clear IndexedDB databases (best-effort)
          if ((window as any).indexedDB?.databases) {
            const dbs = await (window as any).indexedDB.databases();
            await Promise.all(
              dbs
                .map((db: any) => db?.name)
                .filter(Boolean)
                .map((name: string) => new Promise<void>((resolve) => {
                  const req = indexedDB.deleteDatabase(name);
                  req.onsuccess = req.onerror = req.onblocked = () => resolve();
                }))
            );
          }
        } catch {}

        setStatus("تم مسح الكاش وإلغاء تسجيل Service Worker. يرجى إعادة تحميل الصفحة.");
      } catch (e) {
        setStatus("حدث خطأ أثناء التنظيف. جرب إعادة التحميل ثم افتح /reset مرة أخرى.");
      }
    };
    void run();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Helmet>
        <title>إعادة تعيين الكاش | Reset Cache</title>
        <meta name="description" content="مسح الكاش وإلغاء تسجيل Service Worker لإصلاح مشاكل التحميل" />
        <link rel="canonical" href="/reset" />
      </Helmet>
      <div className="max-w-lg w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">إعادة تعيين الكاش</h1>
        <p className="text-muted-foreground">{status}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            إعادة التحميل الآن
          </button>
          <button
            className="px-4 py-2 rounded-md border"
            onClick={() => (window.location.href = "/")}>
            العودة للرئيسية
          </button>
        </div>
      </div>
    </main>
  );
}
