import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface RedirectToPrimaryStoreProps {
  to: 'store-themes' | 'banner-management';
}

const RedirectToPrimaryStore: React.FC<RedirectToPrimaryStoreProps> = ({ to }) => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const go = async () => {
      try {
        if (!user) {
          setError('غير مسجل دخول');
          return;
        }
        // Get profile id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        if (profileError || !profile) throw profileError || new Error('لم يتم العثور على الملف الشخصي');

        // Get primary/active affiliate store
        const { data: stores, error: storesError } = await supabase
          .from('affiliate_stores')
          .select('id')
          .eq('profile_id', profile.id)
          .eq('is_active', true)
          .limit(1);
        if (storesError) throw storesError;
        const primaryStore = stores?.[0];
        if (!primaryStore?.id) throw new Error('لا يوجد متجر نشط مرتبط بالحساب');

        navigate(`/${to}/${primaryStore.id}`, { replace: true });
      } catch (e: any) {
        console.error('RedirectToPrimaryStore error:', e);
        setError(e?.message || 'تعذر التوجيه');
      } finally {
        setLoading(false);
      }
    };

    go();
  }, [navigate, to, user]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">جاري التوجيه للمتجر...</p>
          </>
        ) : error ? (
          <>
            <p className="text-destructive mb-2">{error}</p>
            <button
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
              onClick={() => navigate('/affiliate')}
            >
              العودة للوحة التحكم
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default RedirectToPrimaryStore;
