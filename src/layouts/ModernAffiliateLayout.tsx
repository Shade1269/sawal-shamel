import { AffiliateSidebar } from "@/components/navigation"
import { AffiliateHeader } from '@/components/layout/AffiliateHeader';
import { BaseLayout } from './BaseLayout';
import { useDarkMode } from "@/shared/components/DarkModeProvider"
import { useSidebarState } from "@/hooks/useSidebarState"

export default function ModernAffiliateLayout() {
  const { isDarkMode } = useDarkMode()
  const { state: sidebarState } = useSidebarState()

  return (
    <div className="relative min-h-screen flex w-full overflow-hidden bg-background">
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
      
      <AffiliateSidebar />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 bg-gradient-muted ${sidebarState.isCollapsed ? 'md:mr-16' : 'md:mr-64'}`}>
        <AffiliateHeader />
        <BaseLayout
          showHeader={false}
          showSidebar={false}
          contentClassName="bg-background/50 p-4 md:p-6"
        />
      </div>
    </div>
  )
}