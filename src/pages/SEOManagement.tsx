import React from 'react';
import { SEODashboard } from '@/components/seo/SEODashboard';
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/seo/StructuredData';

const SEOManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Add structured data for this page */}
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      
      <div className="container mx-auto p-6">
        <SEODashboard />
      </div>
    </div>
  );
};

export default SEOManagement;