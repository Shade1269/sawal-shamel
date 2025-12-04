import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface SafeProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface SafeUserListProps {
  className?: string;
  limit?: number;
  showRole?: boolean;
  showPoints?: boolean;
}

export const SafeUserList: React.FC<SafeUserListProps> = ({
  className = "",
  limit = 10,
  showRole = true,
  showPoints = false
}) => {
  const [users, setUsers] = useState<SafeProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [limit]);

  const loadUsers = async () => {
    try {
      // Use the safe_profiles view to get only non-sensitive data
      const { data, error } = await supabase
        .from('safe_profiles')
        .select('id, full_name, avatar_url, role, is_active, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">جاري التحميل...</div>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback>
              {user.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {user.full_name || 'مستخدم'}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {showRole && (
                <Badge variant="outline" className="text-xs">
                  {user.role}
                </Badge>
              )}
              {showPoints && (
                <span>0 نقطة</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};