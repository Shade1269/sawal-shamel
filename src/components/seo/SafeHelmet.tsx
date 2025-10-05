import React from 'react';

// Minimal no-op Helmet/HelmetProvider to avoid vendor init issues in production
export const Helmet: React.FC<React.PropsWithChildren> = ({ children }) => null;
export const HelmetProvider: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>;

export default Helmet;
