-- إضافة Gaming Settings لجدول affiliate_stores
ALTER TABLE affiliate_stores
ADD COLUMN IF NOT EXISTS gaming_settings JSONB DEFAULT '{
  "enabled": true,
  "theme": "cyberpunk",
  "performanceMode": "high",
  "features": {
    "mouseTrail": true,
    "tilt3D": true,
    "particles": true,
    "scanLines": true,
    "gridBackground": true,
    "parallax": true,
    "glowEffects": true,
    "soundEffects": false,
    "soundVolume": 50,
    "holographic": true,
    "laserClicks": true,
    "nebulaBackground": true,
    "portalTransitions": true,
    "quantumGlitch": false,
    "energyShield": true,
    "warpSpeed": true,
    "matrixRain": false,
    "glitchEffect": false,
    "timeDilation": false,
    "magneticAttraction": true,
    "physicsEngine": true,
    "gravitySimulation": false,
    "auroraBorealis": true,
    "shootingStars": true,
    "blackHole": false,
    "cosmicDust": true,
    "weatherEffects": false,
    "weatherType": "auto",
    "liveNotifications": true,
    "visitorCounter": true,
    "heatmap": false
  }
}'::jsonb;

-- إضافة تعليق
COMMENT ON COLUMN affiliate_stores.gaming_settings IS 'إعدادات Gaming Mode للمتجر - يتحكم بها المسوق من لوحة التحكم';

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_affiliate_stores_gaming_enabled
ON affiliate_stores ((gaming_settings->>'enabled'));