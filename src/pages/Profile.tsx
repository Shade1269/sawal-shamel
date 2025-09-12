import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from '@/contexts/AuthContext';
import { User, Mail, Phone, Camera, Save, Crown, Award, Star, Medal, Home, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { profile, updateProfile } = useAuthContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || ''
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'merchant': return <Award className="h-5 w-5 text-blue-500" />;
      case 'affiliate': return <Star className="h-5 w-5 text-purple-500" />;
      default: return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير النظام';
      case 'merchant': return 'تاجر';
      case 'affiliate': return 'مسوق بالعمولة';
      case 'customer': return 'عميل';
      default: return 'مستخدم';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-bronze text-bronze-foreground';
      case 'silver': return 'bg-muted text-muted-foreground';
      case 'gold': return 'bg-premium text-premium-foreground';
      case 'legendary': return 'bg-gradient-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleSave = async () => {
    if (updateProfile) {
      await updateProfile(formData);
      setIsEditing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← العودة
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            الملف الشخصي
          </h1>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          الصفحة الرئيسية
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="relative mx-auto mb-4">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback className="text-2xl">
                    {profile?.full_name?.charAt(0).toUpperCase() || 'م'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  variant="outline"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <CardTitle className="flex items-center justify-center gap-2">
                {getRoleIcon(profile?.role || '')}
                {profile?.full_name}
              </CardTitle>
              <CardDescription>
                {getRoleName(profile?.role || '')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {profile?.role === 'affiliate' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">المستوى</span>
                    <Badge className={getLevelColor(profile.level)}>
                      {profile.level}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">النقاط</span>
                    <div className="flex items-center gap-1">
                      <Medal className="h-4 w-4" />
                      <span className="font-semibold">{profile.points}</span>
                    </div>
                  </div>
                  <Separator />
                </>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">الحالة</span>
                <Badge variant={profile?.is_active ? "default" : "secondary"}>
                  {profile?.is_active ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">تاريخ الانضمام</span>
                <span className="text-sm">
                  {new Date(profile?.created_at || '').toLocaleDateString('ar-SA')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>المعلومات الشخصية</CardTitle>
                  <CardDescription>
                    قم بتحديث معلوماتك الشخصية
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    تعديل
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="ml-2 h-4 w-4" />
                      حفظ
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      إلغاء
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">الاسم الكامل</Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{profile?.full_name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profile?.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile?.phone || 'لم يتم تحديده'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>نوع الحساب</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                    {getRoleIcon(profile?.role || '')}
                    <span>{getRoleName(profile?.role || '')}</span>
                  </div>
                </div>
              </div>

              {profile?.role === 'affiliate' && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">إحصائيات المسوق</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{profile.points}</div>
                        <div className="text-sm text-muted-foreground">إجمالي النقاط</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-accent">{profile.total_earnings || 0}</div>
                        <div className="text-sm text-muted-foreground">إجمالي الأرباح (ريال)</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-premium">{profile.level}</div>
                        <div className="text-sm text-muted-foreground">المستوى الحالي</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;