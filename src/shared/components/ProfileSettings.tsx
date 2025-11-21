import React, { useState, useEffect } from 'react';
import { 
  UnifiedButton, 
  UnifiedInput, 
  UnifiedCard, 
  UnifiedCardHeader, 
  UnifiedCardTitle, 
  UnifiedCardDescription, 
  UnifiedCardContent,
  UnifiedBadge,
  UnifiedDialog,
  UnifiedDialogTrigger,
  UnifiedDialogContent,
  UnifiedDialogHeader,
  UnifiedDialogTitle,
  UnifiedDialogDescription,
  UnifiedSelect,
  UnifiedSelectTrigger,
  UnifiedSelectValue,
  UnifiedSelectContent,
  UnifiedSelectItem
} from '@/components/design-system';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Settings, User, Moon, Sun, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import { supabase } from '@/integrations/supabase/client';
import AvatarUpload from '@/shared/components/AvatarUpload';

interface ProfileSettingsProps {
  profile: any;
  onProfileUpdate: (updatedProfile: any) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onProfileUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    whatsapp: profile?.whatsapp || '',
    status: 'online'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Sync local state with global dark mode
  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Check if user has auth_user_id
      if (!profile?.auth_user_id) {
        throw new Error('معرف المستخدم غير موجود');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', profile.auth_user_id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      onProfileUpdate(data);
      toast({
        title: "تم التحديث",
        description: "تم تحديث معلومات الملف الشخصي بنجاح"
      });
      setOpen(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "خطأ في التحديث",
        description: error.message || "فشل في تحديث الملف الشخصي",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
    onProfileUpdate({ ...profile, avatar_url: avatarUrl });
    toast({
      title: "تم تحديث الصورة",
      description: "تم تحديث صورة الملف الشخصي بنجاح"
    });
  };

  const toggleDarkModeLocal = () => {
    toggleDarkMode();
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور الجديدة وتأكيدها غير متطابقتين",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تغيير كلمة المرور بنجاح"
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: error.message || "فشل في تغيير كلمة المرور",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <UnifiedDialog open={open} onOpenChange={setOpen}>
      <UnifiedDialogTrigger asChild>
        <UnifiedButton variant="ghost" size="icon" className="shrink-0" aria-label="الإعدادات">
          <Settings className="h-4 w-4" />
        </UnifiedButton>
      </UnifiedDialogTrigger>
      <UnifiedDialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rtl z-[100]" dir="rtl" variant="glass">
        <UnifiedDialogHeader>
          <div className="flex items-center justify-between">
            <UnifiedDialogTitle className="arabic-text flex items-center gap-2">
              <User className="h-5 w-5" />
              الملف الشخصي والإعدادات
            </UnifiedDialogTitle>
            <UnifiedButton
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </UnifiedButton>
          </div>
          <UnifiedDialogDescription className="sr-only">
            إعدادات الملف الشخصي والحساب
          </UnifiedDialogDescription>
        </UnifiedDialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <UnifiedCard variant="glass" padding="md" hover="lift">
            <UnifiedCardHeader>
              <UnifiedCardTitle className="text-sm arabic-text">الصورة الشخصية</UnifiedCardTitle>
            </UnifiedCardHeader>
            <UnifiedCardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile?.avatar_url} alt="Profile" />
                  <AvatarFallback className="text-lg">
                    {(profile?.full_name || 'أ')[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <AvatarUpload
                    onAvatarUpload={handleAvatarUpdate}
                  />
                </div>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Personal Info */}
          <UnifiedCard variant="glass" padding="md" hover="lift">
            <UnifiedCardHeader>
              <UnifiedCardTitle className="text-sm arabic-text">المعلومات الشخصية</UnifiedCardTitle>
            </UnifiedCardHeader>
            <UnifiedCardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="arabic-text">الاسم الكامل</Label>
                <UnifiedInput
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="أدخل اسمك الكامل"
                  className="arabic-text"
                  variant="default"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="arabic-text">رقم الجوال</Label>
                <UnifiedInput
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="05xxxxxxxx"
                  className="arabic-text"
                  variant="default"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="arabic-text">واتساب</Label>
                <UnifiedInput
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="05xxxxxxxx"
                  className="arabic-text"
                  variant="default"
                />
              </div>

              <div className="space-y-2">
                <Label className="arabic-text">الحالة</Label>
                <UnifiedSelect value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <UnifiedSelectTrigger className="arabic-text" variant="default">
                    <UnifiedSelectValue />
                  </UnifiedSelectTrigger>
                  <UnifiedSelectContent className="z-[110]">
                    <UnifiedSelectItem value="online">متصل</UnifiedSelectItem>
                    <UnifiedSelectItem value="busy">مشغول</UnifiedSelectItem>
                    <UnifiedSelectItem value="away">غائب</UnifiedSelectItem>
                    <UnifiedSelectItem value="offline">غير متصل</UnifiedSelectItem>
                  </UnifiedSelectContent>
                </UnifiedSelect>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Password Change Section */}
          <UnifiedCard variant="glass" padding="md" hover="lift">
            <UnifiedCardHeader>
              <UnifiedCardTitle className="text-sm arabic-text">تغيير كلمة المرور</UnifiedCardTitle>
              <UnifiedCardDescription className="arabic-text">
                قم بتحديث كلمة المرور الخاصة بك
              </UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="arabic-text">كلمة المرور الجديدة</Label>
                <UnifiedInput
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="arabic-text"
                  variant="default"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="arabic-text">تأكيد كلمة المرور</Label>
                <UnifiedInput
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  className="arabic-text"
                  variant="default"
                />
              </div>

              <UnifiedButton 
                onClick={handlePasswordChange} 
                disabled={changingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                fullWidth
                variant="luxury"
                loading={changingPassword}
                loadingText="جاري التغيير..."
              >
                تغيير كلمة المرور
              </UnifiedButton>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Settings */}
          <UnifiedCard variant="glass" padding="md" hover="lift">
            <UnifiedCardHeader>
              <UnifiedCardTitle className="text-sm arabic-text">إعدادات التطبيق</UnifiedCardTitle>
            </UnifiedCardHeader>
            <UnifiedCardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="arabic-text">الوضع الليلي</Label>
                  <p className="text-sm text-muted-foreground arabic-text">
                    تفعيل المظهر الداكن للتطبيق
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <Switch checked={darkMode} onCheckedChange={toggleDarkModeLocal} />
                  <Moon className="h-4 w-4" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="arabic-text">التنبيهات الصوتية</Label>
                  <p className="text-sm text-muted-foreground arabic-text">
                    تفعيل أصوات الإشعارات للرسائل الجديدة
                  </p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* User Account Information */}
          <UnifiedCard variant="glass" padding="md" hover="glow">
            <UnifiedCardHeader>
              <UnifiedCardTitle className="text-sm arabic-text">معلومات الحساب</UnifiedCardTitle>
            </UnifiedCardHeader>
            <UnifiedCardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground arabic-text">البريد الإلكتروني:</span>
                <span className="font-medium arabic-text">{profile?.email || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground arabic-text">الصلاحية:</span>
                <UnifiedBadge 
                  variant={profile?.role === 'admin' ? 'luxury' : profile?.role === 'moderator' ? 'persian' : 'default'}
                  animation="pulse"
                >
                  {profile?.role === 'admin' ? 'مدير عام' : profile?.role === 'moderator' ? 'مشرف' : 'عضو'}
                </UnifiedBadge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground arabic-text">النقاط:</span>
                <UnifiedBadge variant="luxury" dot dotColor="success">
                  {profile?.points || 0}
                </UnifiedBadge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground arabic-text">تاريخ الانضمام:</span>
                <span className="font-medium arabic-text">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground arabic-text">حالة الحساب:</span>
                <UnifiedBadge 
                  variant={profile?.is_active ? 'success' : 'error'}
                  dot
                  dotColor={profile?.is_active ? 'success' : 'error'}
                >
                  {profile?.is_active ? 'نشط' : 'غير نشط'}
                </UnifiedBadge>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <UnifiedButton 
              onClick={handleSaveProfile} 
              disabled={loading}
              fullWidth
              variant="luxury"
              animation="glow"
              loading={loading}
              loadingText="جاري الحفظ..."
            >
              حفظ التغييرات
            </UnifiedButton>
            <UnifiedButton 
              variant="outline" 
              onClick={() => setOpen(false)} 
              disabled={loading}
            >
              إلغاء
            </UnifiedButton>
          </div>
        </div>
      </UnifiedDialogContent>
    </UnifiedDialog>
  );
};

export default ProfileSettings;