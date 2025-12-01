import { useDarkMode } from '@/shared/components/DarkModeProvider';

interface PerformanceHighlight {
  label: string;
  value: string;
}

interface PerformanceHighlightsProps {
  highlights: PerformanceHighlight[];
  userName?: string;
}

export function PerformanceHighlights({ highlights, userName }: PerformanceHighlightsProps) {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`flex h-full flex-col justify-between rounded-[var(--radius-l)] border p-[var(--spacing-lg)] backdrop-blur-xl transition-colors duration-500 ${
      isDarkMode 
        ? 'border-border/50 bg-card/88 shadow-glass-soft'
        : 'border-slate-200/50 bg-white/90 shadow-lg'
    }`}>
      <header className="mb-[var(--spacing-md)]">
        <h2 className={`heading-ar text-xl font-extrabold tracking-tight transition-colors duration-500 ${
          text-foreground
        }`}>أداءك هذا الأسبوع</h2>
        <p className={`elegant-text text-sm transition-colors duration-500 ${
          text-muted-foreground
        }`}>
          {userName}, هذه لمحة سريعة عن حملاتك النشطة.
        </p>
      </header>
      <ul className="grid gap-[var(--spacing-md)] sm:grid-cols-3">
        {highlights.map((item) => (
          <li
            key={item.label}
            className={`rounded-[var(--radius-m)] border p-[var(--spacing-md)] text-sm transition-all duration-500 hover:scale-105 ${
              isDarkMode 
                ? 'border-border/50 bg-card/80 text-foreground hover:bg-card/60'
                : 'border-slate-200/50 bg-white/80 text-slate-800 hover:bg-slate-50/80 shadow-sm hover:shadow-md'
            }`}
          >
            <p className={`text-xs transition-colors duration-500 ${
              text-muted-foreground
            }`}>{item.label}</p>
            <p className="mt-2 text-lg font-semibold premium-text">{item.value}</p>
          </li>
        ))}
      </ul>
      <div className={`mt-[var(--spacing-lg)] rounded-[var(--radius-m)] border border-dashed p-[var(--spacing-md)] text-xs transition-colors duration-500 ${
        isDarkMode 
          ? 'border-border/50 bg-card/60 text-muted-foreground'
          : 'border-slate-300/50 bg-slate-50/60 text-slate-600'
      }`}>
        نصيحة: شارك رابطك بعد تحديث المحتوى – العملاء الذين يشاهدون قصة جديدة ينفقون 18٪ أكثر.
      </div>
    </div>
  );
}
