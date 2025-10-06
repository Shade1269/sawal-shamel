import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from './useFastAuth';

export type UserRole = 'admin' | 'merchant' | 'affiliate' | 'customer' | 'moderator';

export const useUserRoles = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [primaryRole, setPrimaryRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(true);
  const { user } = useFastAuth();

  const fetchUserRoles = async () => {
    if (!user?.id) {
      setRoles([]);
      setPrimaryRole('customer');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // الحصول على جميع الأدوار
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const normalizeRole = (role: string): UserRole => {
        if (role === 'admin') return 'admin';
        if (role === 'merchant') return 'merchant';
        if (role === 'affiliate' || role === 'marketer') return 'affiliate';
        if (role === 'moderator') return 'moderator';
        return 'customer';
      };
      const rolesList = userRoles?.map(ur => normalizeRole(ur.role)) || ['customer'];
      setRoles(rolesList);

      // تحديد الدور الأساسي
      const priority = { admin: 1, merchant: 2, affiliate: 3, moderator: 4, customer: 5 } as const;
      const primary = rolesList.reduce((prev, curr) =>
        (priority as any)[curr] < (priority as any)[prev] ? curr : prev, 'customer' as UserRole
      );
      setPrimaryRole(primary);
      
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRoles(['customer']);
      setPrimaryRole('customer');
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (checkRoles: UserRole[]): boolean => {
    return checkRoles.some(role => roles.includes(role));
  };

  const assignRole = async (targetUserId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: targetUserId,
          role,
          assigned_by: user?.id
        });

      if (error) throw error;
      
      // إذا كان المستخدم الحالي، حدث الأدوار
      if (targetUserId === user?.id) {
        await fetchUserRoles();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error assigning role:', error);
      return { success: false, error };
    }
  };

  const removeRole = async (targetUserId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', targetUserId)
        .eq('role', role);

      if (error) throw error;
      
      // إذا كان المستخدم الحالي، حدث الأدوار
      if (targetUserId === user?.id) {
        await fetchUserRoles();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error removing role:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [user?.id]);

  return {
    roles,
    primaryRole,
    loading,
    hasRole,
    hasAnyRole,
    assignRole,
    removeRole,
    refreshRoles: fetchUserRoles
  };
};