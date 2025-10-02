/**
 * نظام الثيمات المحددة مسبقاً لمتاجر المسوقين
 * 4 ثيمات احترافية جاهزة للاستخدام
 */

export type ThemeType = 'timeless-elegance' | 'graceful-styles' | 'minimal-chic' | 'modern-dark';

export interface StoreTheme {
  id: ThemeType;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  previewImage?: string;
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    cardBg: string;
    buttonText: string;
  };
  fonts: {
    heading: string;
    body: string;
    display?: string;
  };
  styles: {
    borderRadius: string;
    cardElevation: string;
    buttonStyle: 'rounded' | 'square' | 'pill';
    layoutStyle: 'classic' | 'modern' | 'minimal';
    headerStyle: 'transparent' | 'solid' | 'elevated';
  };
  components: {
    hero: {
      style: 'full-height' | 'compact' | 'split';
      overlay: boolean;
      textAlign: 'left' | 'center' | 'right';
    };
    productCard: {
      style: 'elevated' | 'flat' | 'bordered';
      imageRatio: 'square' | 'portrait' | 'landscape';
      hoverEffect: 'lift' | 'zoom' | 'none';
    };
    navigation: {
      position: 'top' | 'side';
      style: 'minimal' | 'prominent' | 'elegant';
    };
  };
}

export const STORE_THEMES: Record<ThemeType, StoreTheme> = {
  'timeless-elegance': {
    id: 'timeless-elegance',
    name: 'Timeless Elegance',
    nameAr: 'الأناقة الخالدة',
    description: 'A luxurious and sophisticated theme with rich golden accents',
    descriptionAr: 'ثيم فاخر ومتطور مع لمسات ذهبية غنية',
    colors: {
      primary: '37 27 19', // Rich brown
      primaryHover: '28 20 14',
      secondary: '184 148 89', // Gold
      accent: '139 107 55', // Darker gold
      background: '250 247 242',
      surface: '255 253 250',
      text: '37 27 19',
      textMuted: '115 100 85',
      border: '209 197 180',
      cardBg: '245 240 232',
      buttonText: '255 253 250'
    },
    fonts: {
      heading: "'Playfair Display', serif",
      body: "'Lora', serif",
      display: "'Cinzel', serif"
    },
    styles: {
      borderRadius: '0.25rem',
      cardElevation: '0 4px 20px rgba(37, 27, 19, 0.15)',
      buttonStyle: 'square',
      layoutStyle: 'classic',
      headerStyle: 'elevated'
    },
    components: {
      hero: {
        style: 'full-height',
        overlay: true,
        textAlign: 'center'
      },
      productCard: {
        style: 'elevated',
        imageRatio: 'portrait',
        hoverEffect: 'lift'
      },
      navigation: {
        position: 'top',
        style: 'elegant'
      }
    }
  },

  'graceful-styles': {
    id: 'graceful-styles',
    name: 'Graceful Styles',
    nameAr: 'أنماط رشيقة',
    description: 'Soft and feminine with delicate pink and beige tones',
    descriptionAr: 'ناعم وأنثوي مع درجات وردي وبيج رقيقة',
    colors: {
      primary: '219 186 177', // Soft pink
      primaryHover: '204 165 154',
      secondary: '234 209 200',
      accent: '194 150 140',
      background: '252 249 247',
      surface: '255 253 251',
      text: '95 75 68',
      textMuted: '155 135 128',
      border: '234 221 215',
      cardBg: '250 244 241',
      buttonText: '95 75 68'
    },
    fonts: {
      heading: "'Cormorant Garamond', serif",
      body: "'Montserrat', sans-serif",
      display: "'Cormorant Garamond', serif"
    },
    styles: {
      borderRadius: '1rem',
      cardElevation: '0 2px 12px rgba(219, 186, 177, 0.12)',
      buttonStyle: 'pill',
      layoutStyle: 'modern',
      headerStyle: 'transparent'
    },
    components: {
      hero: {
        style: 'split',
        overlay: false,
        textAlign: 'left'
      },
      productCard: {
        style: 'flat',
        imageRatio: 'portrait',
        hoverEffect: 'zoom'
      },
      navigation: {
        position: 'top',
        style: 'minimal'
      }
    }
  },

  'minimal-chic': {
    id: 'minimal-chic',
    name: 'Minimal Chic',
    nameAr: 'الشياكة البسيطة',
    description: 'Clean and minimal with warm neutral tones',
    descriptionAr: 'نظيف وبسيط مع درجات محايدة دافئة',
    colors: {
      primary: '165 142 120', // Warm taupe
      primaryHover: '145 122 100',
      secondary: '210 195 175',
      accent: '139 119 101',
      background: '255 254 252',
      surface: '252 250 247',
      text: '60 50 40',
      textMuted: '135 120 105',
      border: '225 218 208',
      cardBg: '249 246 241',
      buttonText: '255 254 252'
    },
    fonts: {
      heading: "'DM Serif Display', serif",
      body: "'Inter', sans-serif",
      display: "'DM Serif Display', serif"
    },
    styles: {
      borderRadius: '0.5rem',
      cardElevation: '0 1px 8px rgba(60, 50, 40, 0.08)',
      buttonStyle: 'rounded',
      layoutStyle: 'minimal',
      headerStyle: 'solid'
    },
    components: {
      hero: {
        style: 'compact',
        overlay: false,
        textAlign: 'left'
      },
      productCard: {
        style: 'bordered',
        imageRatio: 'square',
        hoverEffect: 'none'
      },
      navigation: {
        position: 'top',
        style: 'minimal'
      }
    }
  },

  'modern-dark': {
    id: 'modern-dark',
    name: 'Modern Dark',
    nameAr: 'العصري الداكن',
    description: 'Bold and contemporary with dark elegant tones',
    descriptionAr: 'جريء وعصري مع درجات داكنة أنيقة',
    colors: {
      primary: '45 45 45', // Charcoal
      primaryHover: '30 30 30',
      secondary: '100 100 100',
      accent: '165 142 120', // Warm accent
      background: '18 18 18',
      surface: '28 28 28',
      text: '245 245 245',
      textMuted: '165 165 165',
      border: '60 60 60',
      cardBg: '35 35 35',
      buttonText: '245 245 245'
    },
    fonts: {
      heading: "'Poppins', sans-serif",
      body: "'Roboto', sans-serif",
      display: "'Bebas Neue', sans-serif"
    },
    styles: {
      borderRadius: '0.375rem',
      cardElevation: '0 4px 16px rgba(0, 0, 0, 0.4)',
      buttonStyle: 'rounded',
      layoutStyle: 'modern',
      headerStyle: 'solid'
    },
    components: {
      hero: {
        style: 'full-height',
        overlay: true,
        textAlign: 'center'
      },
      productCard: {
        style: 'elevated',
        imageRatio: 'portrait',
        hoverEffect: 'lift'
      },
      navigation: {
        position: 'top',
        style: 'prominent'
      }
    }
  }
};

export const getThemeById = (themeId: ThemeType): StoreTheme => {
  return STORE_THEMES[themeId] || STORE_THEMES['graceful-styles'];
};

export const getAllThemes = (): StoreTheme[] => {
  return Object.values(STORE_THEMES);
};
