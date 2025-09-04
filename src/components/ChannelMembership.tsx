import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Crown, 
  Shield, 
  User,
  Circle,
  WifiOff,
  Clock,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChannelMembershipProps {
  channelId: string;
  currentProfile: any;
  className?: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    status?: string;
  };
}

const ChannelMembership: React.FC<ChannelMembershipProps> = ({ 
  channelId, 
  currentProfile, 
  className 
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (channelId) {
      loadMembers();
      checkMembership();
    }
  }, [channelId, currentProfile]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          *,
          user:profiles!channel_members_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('channel_id', channelId);

      if (error) {
        console.error('Error loading members:', error);
        return;
      }

      setMembers(data || []);
      // Mock online count (في تطبيق حقيقي، يمكن استخدام Presence API)
      setOnlineCount(Math.floor((data?.length || 0) * 0.7));
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const checkMembership = async () => {
    if (!currentProfile) return;

    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', currentProfile.id)
        .single();

      setIsJoined(!!data && !error);
    } catch (error) {
      setIsJoined(false);
    }
  };

  const handleJoinChannel = async () => {
    if (!currentProfile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: currentProfile.id,
          role: 'member'
        });

      if (error) throw error;

      setIsJoined(true);
      await loadMembers();
      
      toast({
        title: "تم الانضمام",
        description: "مرحباً بك في القناة! 🎉"
      });

      // رسالة ترحيب
      await supabase
        .from('messages')
        .insert({
          content: `🎉 ${currentProfile.full_name || 'عضو جديد'} انضم إلى القناة!`,
          sender_id: currentProfile.id,
          channel_id: channelId,
          message_type: 'system'
        });

    } catch (error) {
      console.error('Error joining channel:', error);
      toast({
        title: "خطأ في الانضمام",
        description: "فشل في الانضمام للقناة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveChannel = async () => {
    if (!currentProfile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', currentProfile.id);

      if (error) throw error;

      setIsJoined(false);
      await loadMembers();
      
      toast({
        title: "تم الخروج",
        description: "تم خروجك من القناة بنجاح"
      });

      // رسالة وداع
      await supabase
        .from('messages')
        .insert({
          content: `👋 ${currentProfile.full_name || 'عضو'} غادر القناة`,
          sender_id: currentProfile.id,
          channel_id: channelId,
          message_type: 'system'
        });

    } catch (error) {
      console.error('Error leaving channel:', error);
      toast({
        title: "خطأ في الخروج",
        description: "فشل في الخروج من القناة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'online':
        return <Circle className="h-2 w-2 fill-green-500 text-green-500" />;
      case 'busy':
        return <Circle className="h-2 w-2 fill-red-500 text-red-500" />;
      case 'away':
        return <Clock className="h-2 w-2 text-yellow-500" />;
      default:
        return <WifiOff className="h-2 w-2 text-gray-400" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm arabic-text flex items-center gap-2">
                <Users className="h-4 w-4" />
                أعضاء القناة
              </CardTitle>
              <CardDescription className="arabic-text">
                {members.length} عضو • {onlineCount} متصل الآن
              </CardDescription>
            </div>
            
            {!isJoined ? (
              <Button 
                size="sm" 
                onClick={handleJoinChannel} 
                disabled={loading}
                className="arabic-text"
              >
                <UserPlus className="h-3 w-3 ml-1" />
                انضمام
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleLeaveChannel} 
                disabled={loading}
                className="arabic-text"
              >
                <UserMinus className="h-3 w-3 ml-1" />
                خروج
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-64">
            <div className="space-y-1 p-4 pt-0">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.user?.avatar_url} alt="Profile" />
                      <AvatarFallback className="text-xs">
                        {(member.user?.full_name || 'أ')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {getStatusIcon(member.user?.status)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium arabic-text truncate">
                        {member.user?.full_name || 'مستخدم'}
                      </span>
                      {getRoleIcon(member.role)}
                    </div>
                    <p className="text-xs text-muted-foreground arabic-text">
                      انضم {new Date(member.joined_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>

                  <Badge variant={member.role === 'admin' ? 'default' : member.role === 'moderator' ? 'secondary' : 'outline'} className="text-xs">
                    {member.role === 'admin' ? 'مدير' : member.role === 'moderator' ? 'مشرف' : 'عضو'}
                  </Badge>
                </div>
              ))}

              {members.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="arabic-text">لا يوجد أعضاء في هذه القناة</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelMembership;