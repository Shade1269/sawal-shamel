import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Hash, 
  Lock, 
  Users, 
  Plus,
  Crown,
  Shield,
  MessageCircle,
  TrendingUp,
  Trophy,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAtlantisSystem } from '@/hooks/useAtlantisSystem';

interface ChatRoom {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  is_active: boolean;
  member_count?: number;
  created_at: string;
  last_message?: {
    content: string;
    sender_name: string;
    created_at: string;
  };
}

const AtlantisChatRooms = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomType, setNewRoomType] = useState<'public' | 'private'>('public');
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const { userLevel } = useAtlantisSystem();

  useEffect(() => {
    if (user) {
      getUserProfile();
      loadRooms();
    }
  }, [user]);

  const getUserProfile = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      setCurrentProfile(profile);
    } catch (error) {
      console.error('Error getting user profile:', error);
    }
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      
      // تحميل الغرف العامة
      const { data: publicRooms, error: publicError } = await supabase
        .from('chat_rooms')
        .select(`
          *
        `)
        .eq('is_active', true)
        .eq('type', 'public')
        .order('created_at', { ascending: false });

      if (publicError) throw publicError;

      // تحميل الغرف الخاصة التي المستخدم عضو فيها
      const { data: privateRooms, error: privateError } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          room_members!inner(user_id)
        `)
        .eq('is_active', true)
        .eq('type', 'private')
        .eq('room_members.user_id', currentProfile?.id)
        .order('created_at', { ascending: false });

      if (privateError) throw privateError;

      const allRooms = [...(publicRooms || []), ...(privateRooms || [])];

      // تحميل عدد الأعضاء وآخر رسالة لكل غرفة
      const roomsWithDetails = await Promise.all(
        allRooms.map(async (room) => {
          // عدد الأعضاء
          const { count: memberCount } = await supabase
            .from('room_members')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .eq('is_banned', false);

          // آخر رسالة
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select(`
              content,
              created_at,
              sender:profiles!chat_messages_sender_id_fkey(full_name)
            `)
            .eq('room_id', room.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...room,
            member_count: memberCount || 0,
            last_message: lastMessage ? {
              content: lastMessage.content,
              sender_name: lastMessage.sender?.full_name || 'مستخدم',
              created_at: lastMessage.created_at
            } : undefined
          };
        })
      );

      setRooms(roomsWithDetails);
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast({
        title: "خطأ في التحميل",
        description: "لم نتمكن من تحميل الغرف",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim() || !currentProfile) return;

    try {
      // التحقق من صلاحية إنشاء الغرف (المستويات العليا فقط)
      if (newRoomType === 'private' && (!userLevel || !['silver', 'gold', 'legendary'].includes(userLevel.current_level))) {
        toast({
          title: "غير مسموح",
          description: "إنشاء الغرف الخاصة متاح للمستوى الفضي وما فوق فقط",
          variant: "destructive"
        });
        return;
      }

      const { data: newRoom, error } = await supabase
        .from('chat_rooms')
        .insert({
          name: newRoomName.trim(),
          description: newRoomDescription.trim() || null,
          type: newRoomType,
          owner_id: currentProfile.id
        })
        .select()
        .single();

      if (error) throw error;

      // إضافة المنشئ كعضو وقائد
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: newRoom.id,
          user_id: currentProfile.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      // إرسال رسالة ترحيبية
      await supabase
        .from('chat_messages')
        .insert({
          room_id: newRoom.id,
          sender_id: currentProfile.id,
          content: `مرحباً بكم في ${newRoomName}! 🎉`,
          message_type: 'system'
        });

      toast({
        title: "تم إنشاء الغرفة",
        description: `تم إنشاء غرفة "${newRoomName}" بنجاح`
      });

      setShowCreateRoom(false);
      setNewRoomName('');
      setNewRoomDescription('');
      setNewRoomType('public');
      loadRooms();

    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "خطأ في الإنشاء",
        description: "لم نتمكن من إنشاء الغرفة",
        variant: "destructive"
      });
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!currentProfile) return;

    try {
      // التحقق من العضوية الحالية
      const { data: existingMember } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', currentProfile.id)
        .maybeSingle();

      if (!existingMember) {
        // الانضمام للغرفة
        const { error } = await supabase
          .from('room_members')
          .insert({
            room_id: roomId,
            user_id: currentProfile.id,
            role: 'member'
          });

        if (error) throw error;
      }

      // الانتقال للغرفة
      navigate(`/atlantis/chat/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "خطأ في الانضمام",
        description: "لم نتمكن من الدخول للغرفة",
        variant: "destructive"
      });
    }
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'private':
        return <Lock className="h-4 w-4" />;
      case 'direct':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const getRoomBadge = (type: string) => {
    const badges = {
      public: { label: 'عامة', color: 'bg-green-100 text-green-800' },
      private: { label: 'خاصة', color: 'bg-blue-100 text-blue-800' },
      direct: { label: 'مباشرة', color: 'bg-purple-100 text-purple-800' }
    };

    const badge = badges[type as keyof typeof badges] || badges.public;
    return (
      <Badge className={`text-xs ${badge.color}`}>
        {badge.label}
      </Badge>
    );
  };

  const formatLastMessageTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `${diffInMinutes} د`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} س`;
    return `${Math.floor(diffInMinutes / 1440)} ي`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل غرف الدردشة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                غرف دردشة أتلانتس
              </h1>
              <p className="text-muted-foreground mt-2">
                تواصل مع المسوقين والتجار في مجتمع أتلانتس
              </p>
            </div>

            <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2">
                  <Plus className="h-4 w-4" />
                  إنشاء غرفة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إنشاء غرفة دردشة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roomName">اسم الغرفة</Label>
                    <Input
                      id="roomName"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="أدخل اسم الغرفة"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="roomDescription">الوصف (اختياري)</Label>
                    <Textarea
                      id="roomDescription"
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                      placeholder="وصف موجز عن الغرفة"
                    />
                  </div>

                  <div>
                    <Label>نوع الغرفة</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={newRoomType === 'public' ? 'default' : 'outline'}
                        onClick={() => setNewRoomType('public')}
                        className="flex-1"
                      >
                        <Hash className="h-4 w-4 mr-2" />
                        عامة
                      </Button>
                      <Button
                        variant={newRoomType === 'private' ? 'default' : 'outline'}
                        onClick={() => setNewRoomType('private')}
                        className="flex-1"
                        disabled={!userLevel || !['silver', 'gold', 'legendary'].includes(userLevel.current_level)}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        خاصة
                      </Button>
                    </div>
                    {newRoomType === 'private' && (!userLevel || !['silver', 'gold', 'legendary'].includes(userLevel.current_level)) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        الغرف الخاصة متاحة للمستوى الفضي وما فوق
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={createRoom} disabled={!newRoomName.trim()} className="flex-1">
                      إنشاء الغرفة
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateRoom(false)} className="flex-1">
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-info border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">إجمالي الغرف</p>
                  <p className="text-2xl font-bold text-blue-700">{rooms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-success border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600">إجمالي الأعضاء</p>
                  <p className="text-2xl font-bold text-green-700">
                    {rooms.reduce((sum, room) => sum + (room.member_count || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-warning border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-yellow-600">نقاط الدردشة</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {userLevel?.total_points || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-premium border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600">مستواك</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {userLevel?.current_level === 'bronze' && 'برونزي'}
                    {userLevel?.current_level === 'silver' && 'فضي'}
                    {userLevel?.current_level === 'gold' && 'ذهبي'}
                    {userLevel?.current_level === 'legendary' && 'أسطوري'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-card/60 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                      {getRoomIcon(room.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg line-clamp-1">{room.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoomBadge(room.type)}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {room.member_count || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {room.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {room.description}
                  </p>
                )}

                {room.last_message && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {room.last_message.sender_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatLastMessageTime(room.last_message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{room.last_message.content}</p>
                  </div>
                )}

                <Button
                  onClick={() => joinRoom(room.id)}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  دخول الغرفة
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 bg-muted/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">لا توجد غرف دردشة</h3>
            <p className="text-muted-foreground mb-4">
              كن أول من ينشئ غرفة دردشة في مجتمع أتلانتس
            </p>
            <Button onClick={() => setShowCreateRoom(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              إنشاء أول غرفة
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AtlantisChatRooms;