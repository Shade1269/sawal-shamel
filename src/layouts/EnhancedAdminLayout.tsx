import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '@/components/app-shell';

const EnhancedAdminLayout: React.FC = () => {
  return (
    <AppShell roleOverride="admin">
      <Outlet />
    </AppShell>
  );
};

export default EnhancedAdminLayout;
