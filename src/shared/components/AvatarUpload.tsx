import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { validateImageFile } from '@/utils/fileValidation';

interface AvatarUploadProps {
  onAvatarUpload: (url: string) => void;
  maxSize?: number; // in MB
  className?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  onAvatarUpload,
  maxSize = 2,
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ✅ Secure validation: extension + MIME + magic bytes + size
    const validation = await validateImageFile(file, {
      maxSize: maxSize * 1024 * 1024,
    });

    if (!validation.valid) {
      toast({
        title: "صورة غير صالحة",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) {
      toast({
        title: "غير مسجل دخول",
        description: "يجب تسجيل الدخول لرفع الصورة",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(file => `${user.id}/${file.name}`);
        await supabase.storage
          .from('avatars')
          .remove(filesToDelete);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      onAvatarUpload(data.publicUrl);

      toast({
        title: "نجح الرفع",
        description: "تم رفع الصورة الشخصية بنجاح"
      });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "خطأ في الرفع",
        description: "فشل في رفع الصورة، حاول مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      
      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20"
      >
        {uploading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>

      {preview && (
        <div className="absolute bottom-12 left-0 bg-card border border-border rounded-lg p-2 shadow-lg z-10">
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-24 h-24 object-cover rounded-full"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-5 w-5"
              onClick={clearPreview}
            >
              <X className="h-2 w-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;