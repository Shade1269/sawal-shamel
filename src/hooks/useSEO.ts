import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  locale?: string;
  siteName?: string;
}

export const useSEO = (seoData: SEOData) => {
  const location = useLocation();

  useEffect(() => {
    // Default values
    const defaults = {
      title: 'منصة التسويق الذكية',
      description: 'أقوى منصة تسويق بالعمولة في الشرق الأوسط مع أدوات ذكية لبناء متجرك الإلكتروني',
      keywords: 'تسويق بالعمولة, متجر إلكتروني, التجارة الإلكترونية, منصة تسويق',
      image: '/images/og-default.jpg',
      type: 'website' as const,
      locale: 'ar_SA',
      siteName: 'منصة التسويق الذكية'
    };

    const finalSEOData = { ...defaults, ...seoData };
    const currentUrl = window.location.origin + location.pathname;

    // Update document title
    document.title = finalSEOData.title;

    // Helper function to update or create meta tag
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isName) {
          meta.setAttribute('name', property);
        } else {
          meta.setAttribute('property', property);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', finalSEOData.description, true);
    updateMetaTag('keywords', finalSEOData.keywords, true);
    updateMetaTag('author', 'منصة التسويق الذكية', true);

    // Open Graph tags
    updateMetaTag('og:title', finalSEOData.title);
    updateMetaTag('og:description', finalSEOData.description);
    updateMetaTag('og:image', finalSEOData.image);
    updateMetaTag('og:url', finalSEOData.url || currentUrl);
    updateMetaTag('og:type', finalSEOData.type);
    updateMetaTag('og:locale', finalSEOData.locale);
    updateMetaTag('og:site_name', finalSEOData.siteName);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:title', finalSEOData.title, true);
    updateMetaTag('twitter:description', finalSEOData.description, true);
    updateMetaTag('twitter:image', finalSEOData.image, true);

    // Additional SEO tags
    updateMetaTag('robots', 'index, follow', true);
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0', true);
    
    // RTL support
    document.documentElement.setAttribute('lang', 'ar');
    document.documentElement.setAttribute('dir', 'rtl');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

  }, [seoData, location.pathname]);
};

// Predefined SEO configurations for different page types
export const SEOConfigs = {
  home: {
    title: 'الصفحة الرئيسية | منصة التسويق الذكية',
    description: 'ابدأ رحلتك في التسويق بالعمولة مع أقوى منصة في الشرق الأوسط. أدوات ذكية، تحليلات متقدمة، ودعم 24/7',
    keywords: 'تسويق بالعمولة, منصة تسويق, التجارة الإلكترونية, ربح من الانترنت'
  },
  
  affiliate: {
    title: 'لوحة تحكم المسوق | منصة التسويق الذكية',  
    description: 'إدارة متجرك الإلكتروني، تتبع المبيعات، وتحليل الأرباح من مكان واحد',
    keywords: 'لوحة تحكم المسوق, إدارة المتجر, تتبع المبيعات, تحليل الأرباح'
  },

  store: (storeName?: string) => ({
    title: `${storeName ? `متجر ${storeName}` : 'المتجر الإلكتروني'} | منصة التسويق الذكية`,
    description: `تسوق من ${storeName || 'متجرنا'} واستمتع بأفضل المنتجات والعروض الحصرية`,
    keywords: 'متجر إلكتروني, تسوق أونلاين, منتجات عالية الجودة',
    type: 'website' as const
  }),

  product: (productName?: string, productDescription?: string) => ({
    title: `${productName || 'منتج'} | متجر إلكتروني`,
    description: productDescription || 'منتج عالي الجودة بأفضل الأسعار',
    keywords: `${productName}, شراء ${productName}, ${productName} أونلاين`,
    type: 'product' as const
  }),

  admin: {
    title: 'لوحة الإدارة | منصة التسويق الذكية',
    description: 'إدارة شاملة للمنصة مع إحصائيات مفصلة وأدوات تحكم متقدمة',
    keywords: 'لوحة إدارة, إدارة منصة, إحصائيات, تحكم'
  }
};