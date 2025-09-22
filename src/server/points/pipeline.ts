import { supabase } from '@/integrations/supabase/client';

export interface GrantPointsResult {
  success: boolean;
  error?: string;
}

/**
 * Manually invoke the paid-order points pipeline.
 * The database trigger will normally call this automatically, but exposing a
 * typed helper makes it easy to retry in tools or admin dashboards.
 */
export const grantPointsForPaidOrder = async (orderId: string): Promise<GrantPointsResult> => {
  if (!orderId) {
    return { success: false, error: 'orderId is required' };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase.rpc('_grant_points_for_paid_order', {
    p_order_id: orderId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};
