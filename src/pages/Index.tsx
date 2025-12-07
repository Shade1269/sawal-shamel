import { useNavigate } from 'react-router-dom';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { 
  HomeHero, 
  HomeUserHeader, 
  HomeFeatureGrid, 
  HomeDashboardCard, 
  HomeAuthCard 
} from '@/components/home';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useFastAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { toggleLanguage } = useLanguage();
  const { store: affiliateStore, isLoading: affiliateStoreLoading } = useAffiliateStore();

  const currentUser = user;

  const handleClick = (path: string) => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    navigate(path);
  };

  const handleDashboardClick = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    if (profile?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (profile?.role === 'affiliate' || profile?.role === 'marketer') {
      navigate('/affiliate');
    } else if (profile?.role === 'merchant') {
      navigate('/merchant');
    } else {
      navigate('/');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.email) return user.email;
    return 'ضيف';
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-anaqati-cream">
      {/* Decorative Background */}
      <div className="decorative-bg" />
      
      {/* User Header */}
      {currentUser && (
        <HomeUserHeader
          userName={getUserDisplayName()}
          isDarkMode={isDarkMode}
          onLanguageToggle={toggleLanguage}
          onDarkModeToggle={toggleDarkMode}
          onSignOut={handleSignOut}
        />
      )}
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <HomeHero />

        <div className="max-w-7xl mx-auto">
          {/* Feature Grid */}
          <HomeFeatureGrid
            userRole={profile?.role}
            affiliateStore={affiliateStore}
            affiliateStoreLoading={affiliateStoreLoading}
            onNavigate={handleClick}
          />

          {/* Dashboard Card for Authenticated Users */}
          {currentUser && (
            <HomeDashboardCard onClick={handleDashboardClick} />
          )}

          {/* Auth Card for Guests */}
          {!currentUser && (
            <HomeAuthCard onNavigate={navigate} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
