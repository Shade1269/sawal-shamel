import { useEffect, useState, useRef } from 'react';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';
import { Hand, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface GestureEvent {
  type: 'shake' | 'tilt' | 'pinch' | 'swipe';
  direction?: 'left' | 'right' | 'up' | 'down';
  intensity?: number;
}

/**
 * Gesture Controls System
 * نظام التحكم بالإيماءات - Shake, Tilt, Pinch, Swipe
 */
export const GestureControls = () => {
  const { settings } = useGamingSettings();
  const [gestureIndicator, setGestureIndicator] = useState<string | null>(null);
  const lastShake = useRef(0);
  const tiltData = useRef({ beta: 0, gamma: 0 });

  // Shake Detection
  useEffect(() => {
    if (!settings.isGamingMode || settings.reducedMotion) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const x = acceleration.x || 0;
      const y = acceleration.y || 0;
      const z = acceleration.z || 0;

      const totalAcceleration = Math.sqrt(x * x + y * y + z * z);

      // Shake detected
      if (totalAcceleration > 30) {
        const now = Date.now();
        if (now - lastShake.current > 1000) {
          lastShake.current = now;
          handleGesture({ type: 'shake', intensity: totalAcceleration });
        }
      }
    };

    // Request permission for iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [settings]);

  // Tilt Detection (Device Orientation)
  useEffect(() => {
    if (!settings.isGamingMode || settings.reducedMotion) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;  // Front-to-back tilt (-180 to 180)
      const gamma = event.gamma || 0; // Left-to-right tilt (-90 to 90)

      // Detect significant tilt
      if (Math.abs(gamma - tiltData.current.gamma) > 30) {
        const direction = gamma > tiltData.current.gamma ? 'right' : 'left';
        handleGesture({ type: 'tilt', direction });
      }

      tiltData.current = { beta, gamma };
    };

    // Request permission for iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [settings]);

  // Swipe Gesture Detection (Touch)
  useEffect(() => {
    if (!settings.isGamingMode) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Minimum swipe distance
      if (Math.abs(deltaX) > 100 || Math.abs(deltaY) > 100) {
        let direction: GestureEvent['direction'];

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        handleGesture({ type: 'swipe', direction });
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [settings]);

  // Handle Gesture Actions
  const handleGesture = (gesture: GestureEvent) => {
    let action = '';

    switch (gesture.type) {
      case 'shake':
        action = 'تحديث الصفحة 🔄';
        window.location.reload();
        break;

      case 'tilt':
        if (gesture.direction === 'right') {
          action = 'التالي ➡️';
          // Scroll to next section
          window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        } else {
          action = 'السابق ⬅️';
          // Scroll to previous section
          window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
        }
        break;

      case 'swipe':
        if (gesture.direction === 'up') {
          action = 'التمرير لأعلى ⬆️';
          window.scrollBy({ top: -300, behavior: 'smooth' });
        } else if (gesture.direction === 'down') {
          action = 'التمرير لأسفل ⬇️';
          window.scrollBy({ top: 300, behavior: 'smooth' });
        } else if (gesture.direction === 'left') {
          action = 'إغلاق القائمة ⬅️';
          // Trigger menu close event
          document.dispatchEvent(new CustomEvent('close-menu'));
        } else if (gesture.direction === 'right') {
          action = 'فتح القائمة ➡️';
          // Trigger menu open event
          document.dispatchEvent(new CustomEvent('open-menu'));
        }
        break;
    }

    // Show visual indicator
    if (action) {
      setGestureIndicator(action);
      toast.success('إيماءة مكتشفة!', {
        description: action,
        duration: 2000,
      });

      setTimeout(() => setGestureIndicator(null), 2000);
    }
  };

  if (!settings.isGamingMode) return null;

  return (
    <>
      {/* Gesture Indicator */}
      {gestureIndicator && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]
                     bg-black/90 backdrop-blur-xl px-8 py-4 rounded-2xl border-2 border-purple-500
                     shadow-2xl animate-bounce"
          style={{
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.6)',
          }}
        >
          <div className="flex items-center gap-3">
            <Hand className="h-6 w-6 text-purple-400 animate-pulse" />
            <p className="text-white font-bold text-lg">{gestureIndicator}</p>
          </div>
        </div>
      )}

      {/* Gesture Guide (shows on first visit) */}
      {settings.performanceMode === 'ultra' && (
        <div className="fixed bottom-4 left-4 z-50">
          <details className="bg-black/80 backdrop-blur-lg rounded-lg p-4 text-white max-w-xs">
            <summary className="cursor-pointer flex items-center gap-2 font-semibold">
              <Hand className="h-4 w-4" />
              دليل الإيماءات
            </summary>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-3 w-3 text-purple-400" />
                <span><strong>هز الجهاز:</strong> تحديث الصفحة</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">📱</span>
                <span><strong>ميلان يمين/يسار:</strong> التنقل</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">👆</span>
                <span><strong>سحب لأعلى/أسفل:</strong> التمرير</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">👈</span>
                <span><strong>سحب يمين/يسار:</strong> القوائم</span>
              </div>
            </div>
          </details>
        </div>
      )}
    </>
  );
};

/**
 * Request Gesture Permissions (for iOS)
 */
export const requestGesturePermissions = async () => {
  if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
    try {
      const motionPermission = await (DeviceMotionEvent as any).requestPermission();
      const orientationPermission = await (DeviceOrientationEvent as any).requestPermission();

      if (motionPermission === 'granted' && orientationPermission === 'granted') {
        toast.success('تم تفعيل التحكم بالإيماءات! 🎉');
        return true;
      }
    } catch (error) {
      console.error('Gesture permission error:', error);
      toast.error('فشل تفعيل الإيماءات');
      return false;
    }
  }
  return true; // Non-iOS devices don't need permission
};
