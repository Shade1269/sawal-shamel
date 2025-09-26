import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';

const WEB_VITALS = ['CLS', 'INP', 'LCP'];

type ReportMetric = Metric & { name: (typeof WEB_VITALS)[number] };

const logMetric = (metric: ReportMetric) => {
  const value = metric.name === 'CLS' ? metric.value.toFixed(3) : metric.value.toFixed(0);
  console.info(`📊 [web-vitals] ${metric.name}: ${value}`, metric);
};

export function registerWebVitals() {
  if (typeof window === 'undefined') {
    return;
  }

  onCLS((metric) => logMetric(metric as ReportMetric));
  onINP((metric) => logMetric(metric as ReportMetric));
  onLCP((metric) => logMetric(metric as ReportMetric));
}
