import { useEffect } from 'react';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import FastAuthForm from '@/components/auth/FastAuthForm';

const FastAuth = () => {
  const { isAuthenticated } = useFastAuth();
  const { goToUserHome } = useSmartNavigation();

  useEffect(() => {
    if (isAuthenticated) {
      goToUserHome();
    }
  }, [isAuthenticated, goToUserHome]);

  // Always render the form without blocking on loading state
  return <FastAuthForm />;
};

export default FastAuth;