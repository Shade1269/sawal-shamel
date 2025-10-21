import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Hash, Lock, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: string;
  is_locked?: boolean;
  member_count?: number;
}

const RoomsList = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const { data: channelsData, error: channelsError } = await supabase
        .from('channels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (channelsError) throw channelsError;

      setChannels(channelsData || []);

      // Load member counts for each channel
      const counts: Record<string, number> = {};
      for (const channel of channelsData || []) {
        const { count } = await supabase
          .from('channel_members')
          .select('*', { count: 'exact', head: true })
          .eq('channel_id', channel.id);
        counts[channel.id] = count || 0;
      }
      setMemberCounts(counts);
    } catch (error) {
      console.error('Error loading channels:', error);
      toast.error('خطأ في تحميل الغرف');
    } finally {
      setLoading(false);
    }
  };

  const joinChannel = async (channelId: string) => {
    if (!user) return;

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!profile) {
        toast.error('الرجاء تسجيل الدخول أولاً');
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('channel_members')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (!existingMember) {
        // Join channel
        const { error } = await supabase
          .from('channel_members')
          .insert({
            channel_id: channelId,
            user_id: profile.id,
            role: 'member'
          });

        if (error) throw error;
      }

      // Navigate to chat with the selected channel
      navigate(`/chat/${channelId}`);
    } catch (error) {
      console.error('Error joining channel:', error);
      toast.error('خطأ في الانضمام للغرفة');
    }
  };

  const getChannelIcon = (type: string, isLocked?: boolean) => {
    if (isLocked) return <Lock className="h-4 w-4" />;
    return <Hash className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الغرف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للرئيسية
            </Button>
            <div>
              <h1 className="text-2xl font-bold">غرف الدردشة</h1>
              <p className="text-muted-foreground">اختر الغرفة التي تريد الانضمام إليها</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <Card key={channel.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getChannelIcon(channel.type, channel.is_locked)}
                  <span className="truncate">{channel.name}</span>
                  {channel.is_locked && (
                    <Badge variant="secondary" className="text-xs">
                      مقفل
                    </Badge>
                  )}
                </CardTitle>
                {channel.description && (
                  <CardDescription className="text-sm">
                    {channel.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{memberCounts[channel.id] || 0} عضو</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => joinChannel(channel.id)}
                    className="group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    انضم للغرفة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {channels.length === 0 && (
          <div className="text-center py-12">
            <Hash className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد غرف متاحة</h3>
            <p className="text-muted-foreground">
              لم يتم إنشاء أي غرف دردشة بعد
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RoomsList;