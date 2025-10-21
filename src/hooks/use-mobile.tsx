import * as React from "react"
import { useDeviceDetection } from './useDeviceDetection'

// Legacy hook - now powered by enhanced device detection
export function useIsMobile() {
  const { isMobile } = useDeviceDetection()
  return isMobile
}

// Additional convenience hooks
export function useIsTablet() {
  const { isTablet } = useDeviceDetection()
  return isTablet
}

export function useIsDesktop() {
  const { isDesktop } = useDeviceDetection()
  return isDesktop
}

export function useHasTouch() {
  const { hasTouch } = useDeviceDetection()
  return hasTouch
}
