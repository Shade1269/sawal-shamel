import { AffiliateSidebar } from "@/components/navigation"
import { AffiliateHeader } from '@/components/layout/AffiliateHeader';
import { BaseLayout } from './BaseLayout';
import { useDarkMode } from "@/shared/components/DarkModeProvider"

export default function ModernAffiliateLayout() {
  const { isDarkMode } = useDarkMode()

  return (
    <div className="relative min-h-screen">
      {/* Decorative background - Subtle */}
      {isDarkMode ? (
        <>
          <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-premium/20 blur-3xl animate-pulse" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-success/15 blur-3xl animate-pulse" />
        </>
      ) : (
        <>
          <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-premium/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-success/12 blur-3xl" />
        </>
      )}

      <BaseLayout
        header={<AffiliateHeader />}
        sidebar={<AffiliateSidebar />}
        showHeader={true}
        showSidebar={true}
        contentClassName="bg-gradient-muted"
      />
    </div>
  )
}