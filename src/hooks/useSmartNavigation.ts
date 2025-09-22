import { useNavigate } from 'react-router-dom';
import { getHomeRouteForRole } from './getHomeRouteForRole';

export const useSmartNavigation = () => {
  const navigate = useNavigate();

  const goToUserHome = (role?: Parameters<typeof getHomeRouteForRole>[0]) => {
    navigate(getHomeRouteForRole(role));
  };

  return {
    goToUserHome,
    navigate
  };
};