import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Camera, Settings, User, Upload, Moon, Sun, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDarkMode } from './DarkModeProvider';
import { supabase } from '@/integrations/supabase/client';
import AvatarUpload from './AvatarUpload';

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
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Sync local state with global dark mode
  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data);
      toast({
        title: "تم التحديث",
        description: "تم تحديث معلومات الملف الشخصي بنجاح"
      });
      setOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "خطأ في التحديث",
        description: "فشل في تحديث الملف الشخصي",
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0" aria-label="الإعدادات">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rtl z-[100]" dir="rtl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="arabic-text flex items-center gap-2">
            <User className="h-5 w-5" />
            الملف الشخصي والإعدادات
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm arabic-text">الصورة الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm arabic-text">المعلومات الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="arabic-text">الاسم الكامل</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="أدخل اسمك الكامل"
                  className="arabic-text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="arabic-text">رقم الجوال</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="05xxxxxxxx"
                  className="arabic-text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="arabic-text">واتساب</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="05xxxxxxxx"
                  className="arabic-text"
                />
              </div>

              <div className="space-y-2">
                <Label className="arabic-text">الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="arabic-text">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[110]">
                    <SelectItem value="online">متصل</SelectItem>
                    <SelectItem value="busy">مشغول</SelectItem>
                    <SelectItem value="away">غائب</SelectItem>
                    <SelectItem value="offline">غير متصل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm arabic-text">إعدادات التطبيق</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveProfile} disabled={loading} className="flex-1">
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettings;