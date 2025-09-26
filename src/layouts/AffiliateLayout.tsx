import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';

const AffiliateLayout: React.FC = () => {
  return (
    <AppShell roleOverride="affiliate">
      <Outlet />
    </AppShell>
  );
};

export default AffiliateLayout;
