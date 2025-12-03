// Sitemap generation utilities

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  private baseUrl: string;
  private urls: SitemapUrl[] = [];

  constructor(baseUrl = window.location.origin) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  // Add URL to sitemap
  addUrl(path: string, options: Partial<SitemapUrl> = {}) {
    const url: SitemapUrl = {
      loc: `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`,
      lastmod: options.lastmod || new Date().toISOString().split('T')[0],
      changefreq: options.changefreq || 'weekly',
      priority: options.priority || 0.5,
      ...options
    };

    this.urls.push(url);
  }

  // Add multiple URLs
  addUrls(paths: (string | { path: string; options?: Partial<SitemapUrl> })[]) {
    paths.forEach(item => {
      if (typeof item === 'string') {
        this.addUrl(item);
      } else {
        this.addUrl(item.path, item.options);
      }
    });
  }

  // Generate static routes
  addStaticRoutes() {
    const staticRoutes = [
      { path: '/', options: { priority: 1.0, changefreq: 'daily' as const } },
      { path: '/about', options: { priority: 0.8, changefreq: 'monthly' as const } },
      { path: '/auth', options: { priority: 0.6, changefreq: 'monthly' as const } },
      { path: '/affiliate-dashboard', options: { priority: 0.9, changefreq: 'daily' as const } },
      { path: '/products', options: { priority: 0.8, changefreq: 'daily' as const } },
      { path: '/stores', options: { priority: 0.8, changefreq: 'daily' as const } },
    ];

    this.addUrls(staticRoutes);
  }

  // Add affiliate store routes
  async addAffiliateStores(stores?: Array<{ slug: string; updatedAt?: string }>) {
    if (!stores) {
      // If no stores provided, try to fetch from API or storage
      try {
        const response = await fetch('/api/stores');
        if (response.ok) {
          stores = await response.json();
        }
      } catch (error) {
        console.warn('Could not fetch stores for sitemap:', error);
        return;
      }
    }

    stores?.forEach(store => {
      this.addUrl(`/affiliate-store/${store.slug}`, {
        lastmod: store.updatedAt,
        changefreq: 'weekly',
        priority: 0.7
      });
    });
  }

  // Add product routes
  async addProducts(products?: Array<{ id: string; slug?: string; updatedAt?: string }>) {
    if (!products) {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          products = await response.json();
        }
      } catch (error) {
        console.warn('Could not fetch products for sitemap:', error);
        return;
      }
    }

    products?.forEach(product => {
      const path = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;
      this.addUrl(path, {
        lastmod: product.updatedAt,
        changefreq: 'weekly',
        priority: 0.6
      });
    });
  }

  // Generate XML sitemap
  generateXML(): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${this.urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return xml;
  }

  // Generate robots.txt content
  generateRobotsTxt(): string {
    const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.baseUrl}/sitemap.xml

# Block admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

# Allow specific public paths
Allow: /affiliate-store/
Allow: /product/
Allow: /store/

# Crawl delay (optional)
Crawl-delay: 1`;

    return robotsTxt;
  }

  // Download sitemap as file
  downloadSitemap() {
    const xml = this.generateXML();
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Download robots.txt
  downloadRobotsTxt() {
    const robotsTxt = this.generateRobotsTxt();
    const blob = new Blob([robotsTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Clear all URLs
  clear() {
    this.urls = [];
  }

  // Get all URLs
  getUrls(): SitemapUrl[] {
    return [...this.urls];
  }
}

// Utility function to create a complete sitemap
export const generateCompleteSitemap = async () => {
  const sitemap = new SitemapGenerator();
  
  // Add static routes
  sitemap.addStaticRoutes();
  
  // Add dynamic routes
  await sitemap.addAffiliateStores();
  await sitemap.addProducts();
  
  return sitemap;
};

// Auto-generate and update sitemap
export const autoUpdateSitemap = async () => {
  try {
    const sitemap = await generateCompleteSitemap();
    const xml = sitemap.generateXML();
    
    // Store in localStorage for demo purposes
    // In production, this would be sent to your backend
    localStorage.setItem('generated-sitemap', xml);

    return xml;
  } catch (error) {
    console.error('❌ Failed to update sitemap:', error);
    throw error;
  }
};