import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar"
import { BaseLayout } from './BaseLayout';
import { MerchantSidebarModern } from '@/components/navigation';
import { MerchantHeader } from '@/components/layout/MerchantHeader';
import { useFastAuth } from "@/hooks/useFastAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function MerchantLayout() {
  const { profile, hasRole } = useFastAuth();
  const { toast } = useToast();

  // Ensure merchant account exists for merchant users
  useEffect(() => {
    const ensureMerchant = async () => {
      try {
        if (!profile?.auth_user_id || !((profile.role === 'merchant') || hasRole?.('merchant'))) return;

        // Resolve profiles.id from auth_user_id to avoid mismatch with user_profiles
        const { data: profRow, error: profErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', profile.auth_user_id)
          .maybeSingle();

        if (profErr && profErr.code !== 'PGRST116') {
          console.error('Profile lookup error:', profErr);
          return;
        }

        const profileId = profRow?.id;
        if (!profileId) return;

        const { data: existing, error } = await supabase
          .from('merchants')
          .select('id')
          .eq('profile_id', profileId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Merchant lookup error:', error);
          return;
        }

        if (!existing) {
          const { error: insertError } = await supabase
            .from('merchants')
            .insert({
              profile_id: profileId,
              business_name: profile.full_name || profile.email || 'Merchant',
              default_commission_rate: 10,
              vat_enabled: false,
            });
          if (insertError) {
            console.error('Merchant creation error:', insertError);
          } else {
            toast({ title: 'تم إنشاء حساب التاجر', description: 'يمكنك الآن إضافة المنتجات.' });
          }
        }
      } catch (e) {
        console.error('ensureMerchant error:', e);
      }
    };

    ensureMerchant();
  }, [profile?.id, profile?.role]);

  return (
    <SidebarProvider>
      <BaseLayout
        header={<MerchantHeader />}
        sidebar={<MerchantSidebarModern />}
        showHeader={true}
        showSidebar={true}
        contentClassName="bg-gradient-muted"
      />
    </SidebarProvider>
  );
}
