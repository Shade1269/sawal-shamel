import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class ProfileRepository {
  /**
   * Get current user's profile using security definer function
   */
  static async getCurrentProfile() {
    const { data, error } = await supabase
      .rpc('get_current_profile');

    if (error) throw error;
    return data?.[0] || null;
  }

  /**
   * Get profile by auth user ID using security definer function
   */
  static async getProfileByAuthId(authUserId: string) {
    const { data, error } = await supabase
      .rpc('get_user_profile', {
        _auth_user_id: authUserId
      });

    if (error) throw error;
    return data?.[0] || null;
  }

  /**
   * Update current user's profile
   */
  static async updateProfile(updates: ProfileUpdate): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('auth_user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Check for orphaned profile data
   */
  static async checkOrphans() {
    const { data, error } = await supabase
      .rpc('check_profile_orphans');

    if (error) throw error;
    return data;
  }

  /**
   * Get user's primary role
   */
  static async getPrimaryRole(authUserId: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('get_primary_role', {
        _user_id: authUserId
      });

    if (error) throw error;
    return data || 'customer';
  }
}
