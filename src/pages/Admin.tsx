import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserProfileDialog from "@/components/UserProfileDialog";
import UserSettingsMenu from "@/components/UserSettingsMenu";
import { 
  Shield, 
  Ban, 
  VolumeX, 
  Clock, 
  AlertTriangle,
  User,
  Users,
  MessageSquare,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  MessageCircle
} from 'lucide-react';

const ADMIN_EMAIL = "Shade199633@icloud.com";

const Admin = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();

  const isAllowed = useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  const [channelName, setChannelName] = useState("");
  const [channelDesc, setChannelDesc] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [channelMembers, setChannelMembers] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<any>(null);
  const [moderationReason, setModerationReason] = useState("");
  const [moderationDuration, setModerationDuration] = useState("24h");
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const callAdminApi = async (action: string, body: any = {}) => {
    if (!session?.access_token) {
      toast({ title: "غير مصرح", description: "سجل دخولك أولاً", variant: "destructive" });
      return { error: "unauthorized" };
    }
    try {
      // Removed sensitive body logging for security
      console.log('Calling admin API:', action);
      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: { action, ...body },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || "خطأ في الخادم");
      }
      
      console.log('Admin API response received');
      return { data };
    } catch (e: any) {
      console.error('API call failed:', e.message);
      toast({ title: "فشل التنفيذ", description: e.message, variant: "destructive" });
      return { error: e.message };
    }
  };

  const loadLists = async () => {
    setLoading(true);
    const [uc, ch, profile] = await Promise.all([
      callAdminApi("list_users", { query: search }),
      callAdminApi("list_channels"),
      // Get current user profile for role checking
      supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user?.id)
        .single()
    ]);
    if (!uc.error) setUsers(uc.data.data || []);
    if (!ch.error) {
      setChannels(ch.data.data || []);
      // Load member count for each channel
      const memberCounts: Record<string, number> = {};
      for (const channel of ch.data.data || []) {
        try {
          const { count } = await supabase
            .from('channel_members')
            .select('*', { count: 'exact' })
            .eq('channel_id', channel.id);
          memberCounts[channel.id] = count || 0;
        } catch (error) {
          console.error('Error loading member count:', error);
          memberCounts[channel.id] = 0;
        }
      }
      setChannelMembers(memberCounts);
    }
    if (!profile.error) setCurrentUserProfile(profile.data);
    setLoading(false);
  };

  const handleModerationAction = async (action: 'ban' | 'mute' | 'tempban', targetUser: any) => {
    if (!targetUser || !moderationReason.trim()) {
      toast({ title: "مطلوب", description: "الرجاء إدخال سبب الإجراء", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      
      // Get current user's profile ID
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (!currentProfile) {
        throw new Error('لم يتم العثور على ملف المستخدم');
      }
      
      let expiresAt = null;
      if (action === 'mute' || action === 'tempban') {
        const hours = moderationDuration === '24h' ? 24 : 1;
        expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      }

      let insertData;
      if (action === 'mute') {
        insertData = {
          user_id: targetUser.id,
          muted_by: currentProfile.id,
          channel_id: channels[0]?.id || null,
          reason: moderationReason,
          expires_at: expiresAt,
          is_active: true
        };
        const { error } = await supabase.from('user_mutes').insert(insertData);
        if (error) throw error;
      } else {
        insertData = {
          user_id: targetUser.id,
          banned_by: currentProfile.id,
          channel_id: action === 'tempban' ? channels[0]?.id : null,
          reason: moderationReason,
          expires_at: expiresAt,
          is_active: true
        };
        const { error } = await supabase.from('user_bans').insert(insertData);
        if (error) throw error;
      }

      toast({
        title: `تم ${action === 'ban' ? 'حظر' : action === 'tempban' ? 'حظر مؤقت' : 'إسكات'} المستخدم`,
        description: `تم ${action === 'ban' ? 'حظر' : action === 'tempban' ? 'حظر مؤقت' : 'إسكات'} ${targetUser.full_name || targetUser.email} بنجاح`
      });

      setSelectedUser(null);
      setModerationReason("");
      loadLists();
    } catch (error) {
      console.error('Moderation action error:', error);
      toast({
        title: "خطأ",
        description: "فشل في تنفيذ الإجراء",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserProfileClick = (user: any) => {
    console.log('Profile clicked for user:', user?.email || user?.id);
    if (!user) {
      toast({ 
        title: "خطأ", 
        description: "لا يمكن عرض البروفايل", 
        variant: "destructive" 
      });
      return;
    }
    setSelectedUserForProfile(user);
    setShowUserProfile(true);
  };

  const handleRoleChange = async (user: any, newRole: string) => {
    try {
      const res = await callAdminApi(newRole === 'moderator' ? 'assign_moderator' : 'update_role', { 
        email: user.email.toLowerCase(),
        role: newRole
      });
      if (!res.error) {
        toast({ 
          title: "تم تغيير الدور", 
          description: `تم تغيير دور ${user.full_name || user.email} إلى ${newRole === 'admin' ? 'مدير' : newRole === 'moderator' ? 'مشرف' : newRole === 'merchant' ? 'تاجر' : 'مسوق'}` 
        });
        loadLists();
      }
    } catch (error) {
      console.error('Role change error:', error);
      toast({
        title: "خطأ",
        description: "فشل في تغيير الدور",
        variant: "destructive"
      });
    }
  };

  const clearChannelMessages = async (channelId: string, channelName: string) => {
    if (!confirm(`هل أنت متأكد من حذف جميع رسائل غرفة "${channelName}"؟`)) return;
    
    try {
      setLoading(true);
      console.log('Clearing messages for channel:', channelId, channelName);
      
      const res = await callAdminApi("clear_channel_messages", { channel_id: channelId });
      
      if (!res.error) {
        toast({ 
          title: "تم المسح بنجاح", 
          description: `تم مسح جميع رسائل غرفة ${channelName}` 
        });
      } else {
        console.error('Clear messages error:', res.error);
        toast({ 
          title: "خطأ في المسح", 
          description: res.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Clear messages exception:', error);
      toast({ 
        title: "خطأ", 
        description: "فشل في مسح الرسائل",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAllowed) {
      loadLists();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllowed]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">الرجاء تسجيل الدخول للوصول إلى لوحة الإدارة</p>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">غير مصرح بالوصول إلى هذه الصفحة</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 space-y-6">
      <header className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">لوحة الإدارة العامة</h1>
        </div>
        <p className="text-muted-foreground">إدارة شاملة للمستخدمين والغرف والصلاحيات</p>
      </header>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Channel Management Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">إدارة الغرف</h3>
              </div>
              
              <div className="space-y-3">
                <Input 
                  placeholder="اسم الغرفة الجديدة" 
                  value={channelName} 
                  onChange={(e) => setChannelName(e.target.value)} 
                />
                <Input 
                  placeholder="وصف الغرفة (اختياري)" 
                  value={channelDesc} 
                  onChange={(e) => setChannelDesc(e.target.value)} 
                />
                <Button
                  onClick={async () => {
                    if (!channelName.trim()) {
                      toast({ title: "الاسم مطلوب", variant: "destructive" });
                      return;
                    }
                    const res = await callAdminApi("create_channel", { name: channelName.trim(), description: channelDesc.trim() || null });
                    if (!res.error) {
                      toast({ title: "تم إنشاء الغرفة", description: "تم إنشاء الغرفة بنجاح" });
                      setChannelName("");
                      setChannelDesc("");
                      loadLists();
                    }
                  }}
                  className="w-full"
                  disabled={loading}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  إنشاء غرفة جديدة
                </Button>
              </div>

              <div className="border-t pt-4 space-y-2">
                <h4 className="font-medium text-sm">الغرف الحالية</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {channels.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between bg-muted/20 p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{channel.name}</span>
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {channelMembers[channel.id] || 0}
                          </Badge>
                        </div>
                        {channel.description && (
                          <p className="text-xs text-muted-foreground mt-1">{channel.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          clearChannelMessages(channel.id, channel.name);
                        }}
                        className="text-destructive hover:text-destructive"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User & Moderator Management Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">إدارة المشرفين</h3>
              </div>

              <div className="space-y-3">
                <Input 
                  placeholder="بريد المستخدم" 
                  value={targetEmail} 
                  onChange={(e) => setTargetEmail(e.target.value)} 
                />
                <Input 
                  placeholder="كلمة المرور (للمستخدمين الجدد)" 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={async () => {
                      if (!targetEmail.trim()) return;
                      const res = await callAdminApi("assign_moderator", { email: targetEmail.trim().toLowerCase() });
                      if (!res.error) {
                        toast({ title: "تم التعيين", description: `${targetEmail} أصبح مشرف` });
                        setTargetEmail("");
                        loadLists();
                      }
                    }}
                    disabled={loading}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    تعيين مشرف
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!targetEmail.trim() || !newPassword.trim()) {
                        toast({ title: "مطلوب", description: "البريد وكلمة المرور مطلوبان", variant: "destructive" });
                        return;
                      }
                      const res = await callAdminApi("create_user", { 
                        email: targetEmail.trim().toLowerCase(), 
                        password: newPassword, 
                        role: "moderator" 
                      });
                      if (!res.error) {
                        toast({ title: "تم الإنشاء", description: `أُنشئ ${targetEmail} كمشرف` });
                        setTargetEmail("");
                        setNewPassword("");
                        loadLists();
                      }
                    }}
                    disabled={loading}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    إنشاء مشرف
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <h4 className="font-medium text-sm">المشرفين الحاليين</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {users.filter(u => u.role === 'moderator').map((moderator) => (
                    <div key={moderator.id} className="flex items-center justify-between bg-accent/20 p-2 rounded">
                      <div className="text-sm">
                        <div className="font-medium">{moderator.full_name || moderator.email}</div>
                        <div className="text-xs text-muted-foreground">{moderator.email}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={async () => {
                          const res = await callAdminApi("revoke_moderator", { email: moderator.email.toLowerCase() });
                          if (!res.error) {
                            toast({ title: "تم السحب", description: `تم سحب الإشراف من ${moderator.email}` });
                            loadLists();
                          }
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {users.filter(u => u.role === 'moderator').length === 0 && (
                    <p className="text-sm text-muted-foreground">لا يوجد مشرفين حالياً</p>
                  )}
                </div>
              </div>
            </div>

            {/* Users & Moderation Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">إدارة الأعضاء</h3>
              </div>

              <div className="flex gap-2 mb-3">
                <Input 
                  placeholder="بحث بالاسم أو البريد" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
                <Button onClick={loadLists} disabled={loading} size="sm">
                  بحث
                </Button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="bg-card border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      {/* User Info - Clickable */}
                      <div 
                        className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-muted/20 p-2 rounded-lg transition-colors select-none"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUserProfileClick(user);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleUserProfileClick(user);
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
                               user.role === 'merchant' ? 'تاجر' :
                               'مسوق'}
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
                      
                      {/* Settings Menu */}
                      <UserSettingsMenu 
                        user={user}
                        currentUserRole={currentUserProfile?.role || 'affiliate'}
                        onModerationAction={handleModerationAction}
                        onRoleChange={handleRoleChange}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* User Profile Dialog */}
      <UserProfileDialog
        user={selectedUserForProfile}
        isOpen={showUserProfile}
        onClose={() => {
          setShowUserProfile(false);
          setSelectedUserForProfile(null);
        }}
      />
    </main>
  );
};

export default Admin;