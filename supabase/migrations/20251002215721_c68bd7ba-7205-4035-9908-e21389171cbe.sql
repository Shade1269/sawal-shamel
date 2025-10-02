-- إضافة الثيمات الجديدة إلى جدول store_themes
-- نتحقق أولاً من عدم وجود السجلات ثم نضيفها
DO $$
BEGIN
  -- Timeless Elegance
  IF NOT EXISTS (SELECT 1 FROM store_themes WHERE name = 'Timeless Elegance') THEN
    INSERT INTO store_themes (name, name_ar, description, description_ar, theme_config, is_active, is_premium)
    VALUES (
      'Timeless Elegance',
      'الأناقة الخالدة',
      'A sophisticated theme with elegant typography and refined aesthetics',
      'ثيم راقي مع طباعة أنيقة وجماليات مصقولة',
      '{
        "id": "timeless-elegance",
        "colors": {
          "primary": "#2c3e50",
          "secondary": "#8b7355",
          "accent": "#d4af37",
          "background": "#fdfaf7",
          "foreground": "#2c2c2c",
          "muted": "#f5f1ed",
          "card": "#ffffff",
          "border": "#e8e3de"
        },
        "typography": {
          "fontFamily": "Playfair Display, serif",
          "headingFont": "Playfair Display, serif"
        },
        "layout": {
          "borderRadius": "0.5rem",
          "spacing": "standard",
          "cardStyle": "elevated"
        },
        "effects": {
          "shadows": "soft",
          "animations": "subtle",
          "gradients": false
        }
      }'::jsonb,
      true,
      false
    );
  END IF;

  -- Graceful Styles
  IF NOT EXISTS (SELECT 1 FROM store_themes WHERE name = 'Graceful Styles') THEN
    INSERT INTO store_themes (name, name_ar, description, description_ar, theme_config, is_active, is_premium)
    VALUES (
      'Graceful Styles',
      'الأساليب الرشيقة',
      'Modern minimalism meets graceful design',
      'الحداثة البسيطة تلتقي بالتصميم الرشيق',
      '{
        "id": "graceful-styles",
        "colors": {
          "primary": "#6b5b95",
          "secondary": "#b8a9c9",
          "accent": "#c9a0dc",
          "background": "#faf9fc",
          "foreground": "#333333",
          "muted": "#f3f0f7",
          "card": "#ffffff",
          "border": "#e5dff0"
        },
        "typography": {
          "fontFamily": "Cormorant Garamond, serif",
          "headingFont": "Cormorant Garamond, serif"
        },
        "layout": {
          "borderRadius": "0.75rem",
          "spacing": "comfortable",
          "cardStyle": "soft"
        },
        "effects": {
          "shadows": "medium",
          "animations": "smooth",
          "gradients": true
        }
      }'::jsonb,
      true,
      false
    );
  END IF;

  -- Minimal Chic
  IF NOT EXISTS (SELECT 1 FROM store_themes WHERE name = 'Minimal Chic') THEN
    INSERT INTO store_themes (name, name_ar, description, description_ar, theme_config, is_active, is_premium)
    VALUES (
      'Minimal Chic',
      'الشيك البسيط',
      'Clean lines and contemporary aesthetics',
      'خطوط نظيفة وجماليات معاصرة',
      '{
        "id": "minimal-chic",
        "colors": {
          "primary": "#34495e",
          "secondary": "#95a5a6",
          "accent": "#e74c3c",
          "background": "#ffffff",
          "foreground": "#2c3e50",
          "muted": "#ecf0f1",
          "card": "#ffffff",
          "border": "#dfe6e9"
        },
        "typography": {
          "fontFamily": "DM Serif Display, serif",
          "headingFont": "DM Serif Display, serif"
        },
        "layout": {
          "borderRadius": "0.25rem",
          "spacing": "compact",
          "cardStyle": "flat"
        },
        "effects": {
          "shadows": "minimal",
          "animations": "none",
          "gradients": false
        }
      }'::jsonb,
      true,
      false
    );
  END IF;

  -- Modern Dark
  IF NOT EXISTS (SELECT 1 FROM store_themes WHERE name = 'Modern Dark') THEN
    INSERT INTO store_themes (name, name_ar, description, description_ar, theme_config, is_active, is_premium)
    VALUES (
      'Modern Dark',
      'الحديث الداكن',
      'Bold and contemporary with dark aesthetics',
      'جريء ومعاصر مع جماليات داكنة',
      '{
        "id": "modern-dark",
        "colors": {
          "primary": "#00d4ff",
          "secondary": "#1a1a2e",
          "accent": "#ff6b6b",
          "background": "#0f0f1e",
          "foreground": "#e0e0e0",
          "muted": "#1a1a2e",
          "card": "#16213e",
          "border": "#2a2a4e"
        },
        "typography": {
          "fontFamily": "Poppins, sans-serif",
          "headingFont": "Bebas Neue, sans-serif"
        },
        "layout": {
          "borderRadius": "1rem",
          "spacing": "spacious",
          "cardStyle": "glass"
        },
        "effects": {
          "shadows": "strong",
          "animations": "dynamic",
          "gradients": true,
          "glow": true
        }
      }'::jsonb,
      true,
      false
    );
  END IF;
END $$;