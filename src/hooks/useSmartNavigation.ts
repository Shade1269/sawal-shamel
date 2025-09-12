import { useNavigate } from 'react-router-dom';
import { useFastAuth } from './useFastAuth';

export const useSmartNavigation = () => {
  const navigate = useNavigate();
  const { profile } = useFastAuth();

  const goToUserHome = () => {
    // Default to unified dashboard if profile isn't loaded yet
    if (!profile) {
      navigate('/dashboard');
      return;
    }

    switch (profile.role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'merchant':
        navigate('/merchant-dashboard');
        break;
      case 'affiliate':
        navigate('/affiliate-dashboard');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  return {
    goToUserHome,
    navigate
  };
};