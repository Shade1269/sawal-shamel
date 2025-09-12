import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Camera, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import AvatarUpload from './AvatarUpload';

interface UserProfileProps {
  profile: any;
  onProfileUpdate: (updatedProfile: any) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile, onProfileUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setAvatarUrl(profile?.avatar_url || '');
  }, [profile]);

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl
        })
        .eq('id', profile.id)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }

      onProfileUpdate(data);
      setIsOpen(false);
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث الملف الشخصي بنجاح"
      });

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

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <User className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md rtl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="arabic-text">الملف الشخصي</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt="Profile picture" />
                <AvatarFallback className="text-lg">
                  {fullName ? fullName[0] : 'أ'}
                </AvatarFallback>
              </Avatar>
              
              <div className="absolute -bottom-2 -right-2">
                <AvatarUpload
                  onAvatarUpload={handleAvatarUpload}
                  maxSize={2}
                  className="relative"
                />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground arabic-text">
              انقر على أيقونة الكاميرا لتغيير الصورة
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="arabic-text">الاسم الكامل</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                className="arabic-text"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="arabic-text">البريد الإلكتروني</Label>
              <Input
                id="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="arabic-text"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="arabic-text"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              حفظ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;