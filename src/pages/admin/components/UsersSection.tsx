import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, User } from 'lucide-react';
import UserSettingsMenu from "@/components/UserSettingsMenu";

/**
 * Props للـ UsersSection Component
 */
interface UsersSectionProps {
  users: any[];
  loading: boolean;
  currentUserRole: string;
  onSearch: () => void;
  onProfileClick: (user: any) => void;
  onModerationAction: (action: 'ban' | 'mute' | 'tempban', targetUser: any) => Promise<void>;
  onRoleChange: (user: any, newRole: string) => Promise<void>;
}

/**
 * قسم إدارة المستخدمين
 * يتيح البحث عن المستخدمين وعرض معلوماتهم وإدارتهم
 */
export function UsersSection({
  users,
  loading,
  currentUserRole,
  onSearch,
  onProfileClick,
  onModerationAction,
  onRoleChange
}: UsersSectionProps) {
  // حالات محلية للنماذج
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-icon-wrapper flex items-center justify-center shadow-lg shadow-primary/25">
          <Users className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-2xl font-black admin-card">إدارة الأعضاء</h3>
      </div>

      <div className="flex gap-2 mb-3">
        <Input
          placeholder="بحث بالاسم أو البريد"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={onSearch} disabled={loading} size="sm">
          بحث
        </Button>
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2">
        {users.map((user) => (
          <div key={user.id} className="bg-card border rounded-lg p-3">
            <div className="flex items-center justify-between">
              {/* معلومات المستخدم - قابلة للنقر */}
              <div
                className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-muted/20 p-2 rounded-lg transition-colors select-none"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onProfileClick(user);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onProfileClick(user);
                  }
                }}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url} alt={user.full_name} />
                  <AvatarFallback>
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">
                      {user.full_name || user.email}
                    </span>
                    <Badge
                      variant={
                        user.role === 'admin' ? 'default' :
                        user.role === 'moderator' ? 'secondary' :
                        'outline'
                      }
                      className="text-xs shrink-0"
                    >
                      {user.role === 'admin' ? 'مدير' :
                       user.role === 'moderator' ? 'مشرف' :
                       user.role === 'affiliate' || user.role === 'merchant' || user.role === 'marketer' ? 'مسوق' :
                       'مستخدم'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className={`h-2 w-2 rounded-full shrink-0 ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  {user.points !== undefined && (
                    <div className="text-xs text-primary font-medium">
                      {user.points} نقطة
                    </div>
                  )}
                </div>
              </div>

              {/* قائمة الإعدادات */}
              <UserSettingsMenu
                user={user}
                currentUserRole={currentUserRole}
                onModerationAction={onModerationAction}
                onRoleChange={onRoleChange}
              />
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            لا يوجد مستخدمين حالياً
          </div>
        )}
      </div>
    </div>
  );
}
