import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAtlantisSystem } from '@/hooks/useAtlantisSystem';
import { 
  Users, 
  Crown, 
  Shield, 
  UserPlus, 
  UserMinus, 
  Settings,
  Star,
  Trophy,
  Target,
  Zap,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AllianceManager = () => {
  const {
    loading,
    userLevel,
    userAlliance,
    userMembership,
    createAlliance,
    joinAlliance,
    leaveAlliance
  } = useAtlantisSystem();

  const { toast } = useToast();
  
  // Create alliance form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: ''
  });

  // Join alliance state
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinAllianceId, setJoinAllianceId] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  const handleCreateAlliance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم التحالف",
        variant: "destructive"
      });
      return;
    }

    setCreateLoading(true);
    const result = await createAlliance({
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description,
      logo_url: formData.logo_url
    });

    if (result) {
      setShowCreateForm(false);
      setFormData({ name: '', slug: '', description: '', logo_url: '' });
    }
    setCreateLoading(false);
  };

  const handleJoinAlliance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinAllianceId.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال معرف التحالف",
        variant: "destructive"
      });
      return;
    }

    setJoinLoading(true);
    const success = await joinAlliance(joinAllianceId);
    if (success) {
      setShowJoinForm(false);
      setJoinAllianceId('');
    }
    setJoinLoading(false);
  };

  const handleLeaveAlliance = async () => {
    if (window.confirm('هل أنت متأكد من رغبتك في ترك التحالف؟')) {
      await leaveAlliance();
    }
  };

  const canCreateAlliance = userLevel && ['silver', 'gold', 'legendary'].includes(userLevel.current_level);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري تحميل بيانات التحالف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Alliance Status */}
      {userAlliance && userMembership ? (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>تحالفي الحالي</CardTitle>
              </div>
              <Badge variant={userMembership.role === 'leader' ? 'default' : 'secondary'}>
                {userMembership.role === 'leader' ? (
                  <div className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    قائد
                  </div>
                ) : (
                  'عضو'
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-primary">
                  {userAlliance.name}
                </h3>
                {userAlliance.description && (
                  <p className="text-muted-foreground mt-1">
                    {userAlliance.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{userAlliance.member_count}</p>
                  <p className="text-sm text-muted-foreground">عضو</p>
                </div>
                <div className="text-center">
                  <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{userAlliance.total_points}</p>
                  <p className="text-sm text-muted-foreground">نقطة</p>
                </div>
                <div className="text-center">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">{userAlliance.total_sales.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">ر.س</p>
                </div>
                <div className="text-center">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{userMembership.contribution_points}</p>
                  <p className="text-sm text-muted-foreground">مساهمتي</p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                {userMembership.role !== 'leader' && (
                  <Button variant="destructive" onClick={handleLeaveAlliance}>
                    <UserMinus className="h-4 w-4 mr-2" />
                    ترك التحالف
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* No Alliance - Show Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                إدارة التحالفات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                لست عضواً في أي تحالف حالياً. يمكنك إنشاء تحالف جديد أو الانضمام لتحالف موجود.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  disabled={!canCreateAlliance}
                  className="h-20"
                >
                  <div className="text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2" />
                    <p>إنشاء تحالف جديد</p>
                    {!canCreateAlliance && (
                      <p className="text-xs opacity-70">(يتطلب مستوى فضي+)</p>
                    )}
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => setShowJoinForm(true)}
                  className="h-20"
                >
                  <div className="text-center">
                    <UserPlus className="h-6 w-6 mx-auto mb-2" />
                    <p>الانضمام لتحالف</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Create Alliance Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>إنشاء تحالف جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAlliance} className="space-y-4">
                  <div>
                    <Label htmlFor="alliance-name">اسم التحالف *</Label>
                    <Input
                      id="alliance-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="اسم تحالفك المميز"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="alliance-slug">الرابط المختصر</Label>
                    <Input
                      id="alliance-slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="alliance-slug"
                    />
                  </div>

                  <div>
                    <Label htmlFor="alliance-description">الوصف</Label>
                    <Textarea
                      id="alliance-description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="وصف موجز عن أهداف التحالف..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="alliance-logo">رابط الشعار</Label>
                    <Input
                      id="alliance-logo"
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={createLoading}>
                      {createLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      إنشاء التحالف
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateForm(false)}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Join Alliance Form */}
          {showJoinForm && (
            <Card>
              <CardHeader>
                <CardTitle>الانضمام لتحالف</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinAlliance} className="space-y-4">
                  <div>
                    <Label htmlFor="alliance-id">معرف التحالف</Label>
                    <Input
                      id="alliance-id"
                      value={joinAllianceId}
                      onChange={(e) => setJoinAllianceId(e.target.value)}
                      placeholder="ادخل معرف التحالف الذي تريد الانضمام إليه"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={joinLoading}>
                      {joinLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      انضمام
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowJoinForm(false)}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* User Level Info */}
      {userLevel && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              مستواك الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">المستوى</p>
                <Badge className={`text-lg ${
                  userLevel.current_level === 'legendary' ? 'bg-purple-500' :
                  userLevel.current_level === 'gold' ? 'bg-yellow-500' :
                  userLevel.current_level === 'silver' ? 'bg-gray-400' : 'bg-orange-500'
                }`}>
                  {userLevel.current_level === 'legendary' ? 'أسطوري' :
                   userLevel.current_level === 'gold' ? 'ذهبي' :
                   userLevel.current_level === 'silver' ? 'فضي' : 'برونزي'}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">النقاط الحالية</p>
                <p className="text-2xl font-bold">{userLevel.total_points}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">للمستوى التالي</p>
                <p className="text-xl font-semibold">
                  {userLevel.next_level_threshold - userLevel.total_points} نقطة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};