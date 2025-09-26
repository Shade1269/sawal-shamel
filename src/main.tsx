import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import { initializePerformanceOptimization } from './utils/bundleOptimization'
import { ThemeProvider } from './components/ThemeProvider'
import { registerServiceWorker } from './pwa/registerServiceWorker'
import { registerWebVitals } from './pwa/reportWebVitals'

// Initialize performance optimization
initializePerformanceOptimization();

if (import.meta.env.PROD) {
  registerServiceWorker();
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
