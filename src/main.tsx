import { StrictMode } from 'react'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from '@/components/seo/SafeHelmet'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/ThemeProvider'
import { unregisterServiceWorker } from './pwa/registerServiceWorker'
import { registerWebVitals } from './pwa/reportWebVitals'

// Expose React globally for any UMD-style dependencies that expect window.React
if (typeof window !== 'undefined') {
  // @ts-ignore
  ;(window as any).React = React

  // Global error hooks to diagnose build-time circular/TDZ issues
  window.addEventListener('error', (e) => {
    try {
      // eslint-disable-next-line no-console
      console.error('[GlobalError]', e.message, e.error?.stack || e.filename || 'no stack');
    } catch {}
  });
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    try {
      // eslint-disable-next-line no-console
      console.error('[UnhandledRejection]', (e as any).reason?.message || e.reason, (e as any).reason?.stack || 'no stack');
    } catch {}
  });
}

if (import.meta.env.PROD) {
  // Temporary hotfix: disable Service Worker to resolve black screen; will re-enable after caches reset
  unregisterServiceWorker();
  registerWebVitals();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>
);
