import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Twitter, 
  Instagram, 
  Facebook, 
  Linkedin,
  Calendar,
  Clock,
  Send,
  Image,
  Video,
  Link2,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

const SocialMediaManager = () => {
  const [newPost, setNewPost] = useState({
    content: '',
    platforms: [] as string[],
    scheduledTime: '',
    mediaType: 'text'
  });

  const [connectedAccounts, setConnectedAccounts] = useState([
    { platform: 'Twitter', handle: '@mystore', connected: true, followers: '2.5K' },
    { platform: 'Instagram', handle: '@mystore', connected: true, followers: '5.2K' },
    { platform: 'Facebook', handle: 'My Store', connected: false, followers: '0' },
    { platform: 'LinkedIn', handle: 'My Store', connected: false, followers: '0' }
  ]);

  const [scheduledPosts] = useState([
    {
      id: 1,
      content: 'عرض خاص! خصم 25% على جميع المنتجات هذا الأسبوع',
      platforms: ['Twitter', 'Instagram'],
      scheduledTime: '2024-01-15 10:00',
      status: 'scheduled'
    },
    {
      id: 2,
      content: 'منتج جديد وصل! تسوق الآن واحصل على شحن مجاني',
      platforms: ['Instagram', 'Facebook'],
      scheduledTime: '2024-01-16 14:30',
      status: 'scheduled'
    }
  ]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Twitter': return <Twitter className="h-4 w-4" />;
      case 'Instagram': return <Instagram className="h-4 w-4" />;
      case 'Facebook': return <Facebook className="h-4 w-4" />;
      case 'LinkedIn': return <Linkedin className="h-4 w-4" />;
      default: return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Twitter': return 'bg-blue-500';
      case 'Instagram': return 'bg-pink-500';
      case 'Facebook': return 'bg-blue-600';
      case 'LinkedIn': return 'bg-blue-700';
      default: return 'bg-gray-500';
    }
  };

  const handleCreatePost = () => {
    if (!newPost.content.trim()) {
      toast.error('يرجى كتابة محتوى المنشور');
      return;
    }
    if (newPost.platforms.length === 0) {
      toast.error('يرجى اختيار منصة واحدة على الأقل');
      return;
    }

    toast.success('تم إنشاء المنشور بنجاح!');
    setNewPost({ content: '', platforms: [], scheduledTime: '', mediaType: 'text' });
  };

  const togglePlatform = (platform: string) => {
    setNewPost(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50">
          <TabsTrigger value="create">إنشاء منشور</TabsTrigger>
          <TabsTrigger value="scheduled">المنشورات المجدولة</TabsTrigger>
          <TabsTrigger value="accounts">الحسابات المتصلة</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                إنشاء منشور جديد
              </CardTitle>
              <CardDescription>
                أنشئ وجدول منشوراتك على وسائل التواصل الاجتماعي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Content */}
              <div>
                <label className="text-sm font-medium mb-2 block">المحتوى</label>
                <Textarea
                  placeholder="اكتب محتوى المنشور هنا..."
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[120px]"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {newPost.content.length}/280 حرف
                </div>
              </div>

              {/* Media Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">نوع المحتوى</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newPost.mediaType === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewPost(prev => ({ ...prev, mediaType: 'text' }))}
                  >
                    نص
                  </Button>
                  <Button
                    type="button"
                    variant={newPost.mediaType === 'image' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewPost(prev => ({ ...prev, mediaType: 'image' }))}
                  >
                    <Image className="h-4 w-4 mr-1" />
                    صورة
                  </Button>
                  <Button
                    type="button"
                    variant={newPost.mediaType === 'video' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewPost(prev => ({ ...prev, mediaType: 'video' }))}
                  >
                    <Video className="h-4 w-4 mr-1" />
                    فيديو
                  </Button>
                </div>
              </div>

              {/* Platforms */}
              <div>
                <label className="text-sm font-medium mb-2 block">المنصات</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {connectedAccounts.map((account) => (
                    <Button
                      key={account.platform}
                      type="button"
                      variant={newPost.platforms.includes(account.platform) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => togglePlatform(account.platform)}
                      disabled={!account.connected}
                      className={`flex items-center gap-2 ${!account.connected ? 'opacity-50' : ''}`}
                    >
                      {getPlatformIcon(account.platform)}
                      {account.platform}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Scheduled Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">تاريخ النشر</label>
                  <Input
                    type="datetime-local"
                    value={newPost.scheduledTime}
                    onChange={(e) => setNewPost(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCreatePost} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {newPost.scheduledTime ? 'جدولة المنشور' : 'نشر فوري'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-turquoise" />
                المنشورات المجدولة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="text-sm font-medium">{post.content}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {post.platforms.map((platform) => (
                          <Badge
                            key={platform}
                            variant="secondary"
                            className={`${getPlatformColor(platform)} text-primary-foreground`}
                          >
                            {getPlatformIcon(platform)}
                            <span className="mr-1">{platform}</span>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {post.scheduledTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-premium" />
                الحسابات المتصلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {connectedAccounts.map((account) => (
                  <div
                    key={account.platform}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getPlatformColor(account.platform)}`}>
                        {getPlatformIcon(account.platform)}
                      </div>
                      <div>
                        <div className="font-medium">{account.platform}</div>
                        <div className="text-sm text-muted-foreground">
                          {account.handle} • {account.followers} متابع
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={account.connected ? 'destructive' : 'default'}
                      size="sm"
                    >
                      {account.connected ? 'قطع الاتصال' : 'ربط الحساب'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  إجمالي التفاعل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15.2K</div>
                <div className="text-sm text-muted-foreground">+12% من الشهر الماضي</div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>الوصول</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45.8K</div>
                <div className="text-sm text-muted-foreground">+8% من الشهر الماضي</div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>المتابعون الجدد</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">234</div>
                <div className="text-sm text-muted-foreground">+23% من الشهر الماضي</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialMediaManager;