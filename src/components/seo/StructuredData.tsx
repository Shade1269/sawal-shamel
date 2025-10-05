import React from 'react';
import { Helmet } from 'react-helmet-async';

interface WebsiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone?: string;
    contactType: string;
    availableLanguage: string[];
  };
}

interface ProductSchema {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description?: string;
  image?: string[];
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability: string;
    url?: string;
  };
}

interface StoreSchema {
  '@context': 'https://schema.org';
  '@type': 'Store';
  name: string;
  description?: string;
  url: string;
  image?: string;
  address?: {
    '@type': 'PostalAddress';
    addressCountry: string;
    addressLocality?: string;
  };
}

interface StructuredDataProps {
  type: 'website' | 'organization' | 'product' | 'store';
  data: any;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const generateSchema = () => {
    const baseUrl = window.location.origin;
    
    switch (type) {
      case 'website':
        const websiteSchema: WebsiteSchema = {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: data.name || 'منصة التسويق الذكية',
          url: baseUrl,
          description: data.description,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        };
        return websiteSchema;

      case 'organization':
        const orgSchema: OrganizationSchema = {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: data.name || 'منصة التسويق الذكية',
          url: baseUrl,
          logo: data.logo || `${baseUrl}/logo.png`,
          description: data.description,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: data.phone,
            contactType: 'customer service',
            availableLanguage: ['Arabic', 'English']
          }
        };
        return orgSchema;

      case 'product':
        const productSchema: ProductSchema = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          description: data.description,
          image: data.images || [],
          brand: data.brand ? {
            '@type': 'Brand',
            name: data.brand
          } : undefined,
          offers: data.price ? {
            '@type': 'Offer',
            price: data.price.toString(),
            priceCurrency: data.currency || 'SAR',
            availability: 'https://schema.org/InStock',
            url: window.location.href
          } : undefined
        };
        return productSchema;

      case 'store':
        const storeSchema: StoreSchema = {
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: data.name,
          description: data.description,
          url: window.location.href,
          image: data.image,
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'SA',
            addressLocality: data.city
          }
        };
        return storeSchema;

      default:
        return null;
    }
  };

  const schema = generateSchema();

  if (!schema) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Predefined structured data components
export const WebsiteStructuredData: React.FC = () => (
  <StructuredData
    type="website"
    data={{
      name: 'منصة التسويق الذكية',
      description: 'أقوى منصة تسويق بالعمولة في الشرق الأوسط'
    }}
  />
);

export const OrganizationStructuredData: React.FC = () => (
  <StructuredData
    type="organization"
    data={{
      name: 'منصة التسويق الذكية',
      description: 'نساعدك في بناء متجرك الإلكتروني وتحقيق النجاح في التسويق بالعمولة',
      logo: '/images/logo.png'
    }}
  />
);

export const ProductStructuredData: React.FC<{
  product: {
    name: string;
    description?: string;
    price?: number;
    currency?: string;
    images?: string[];
    brand?: string;
  };
}> = ({ product }) => (
  <StructuredData type="product" data={product} />
);

export const StoreStructuredData: React.FC<{
  store: {
    name: string;
    description?: string;
    image?: string;
    city?: string;
  };
}> = ({ store }) => (
  <StructuredData type="store" data={store} />
);