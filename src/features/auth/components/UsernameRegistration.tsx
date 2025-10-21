import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UsernameRegistrationProps {
  onUsernameSubmit: (username: string) => Promise<void>;
  isLoading?: boolean;
}

const UsernameRegistration: React.FC<UsernameRegistrationProps> = ({
  onUsernameSubmit,
  isLoading = false
}) => {
  const [username, setUsername] = useState('');
  const [validating, setValidating] = useState(false);
  const { toast } = useToast();

  const validateUsername = (username: string): boolean => {
    if (username.length < 3) {
      toast({
        title: 'اسم المستخدم قصير جداً',
        description: 'يجب أن يكون اسم المستخدم مكوناً من 3 أحرف على الأقل',
        variant: 'destructive'
      });
      return false;
    }

    if (username.length > 20) {
      toast({
        title: 'اسم المستخدم طويل جداً',
        description: 'يجب أن يكون اسم المستخدم مكوناً من 20 حرفاً على الأكثر',
        variant: 'destructive'
      });
      return false;
    }

    // التحقق من الأحرف المسموحة (عربي، انجليزي، أرقام، شرطة سفلية)
    const allowedPattern = /^[a-zA-Z0-9\u0600-\u06FF_\s]+$/;
    if (!allowedPattern.test(username)) {
      toast({
        title: 'أحرف غير مسموحة',
        description: 'يمكن استخدام الأحرف العربية والإنجليزية والأرقام والشرطة السفلية فقط',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم المستخدم',
        variant: 'destructive'
      });
      return;
    }

    if (!validateUsername(trimmedUsername)) {
      return;
    }

    setValidating(true);
    try {
      await onUsernameSubmit(trimmedUsername);
    } catch (error) {
      console.error('Error submitting username:', error);
    } finally {
      setValidating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">اختر اسم المستخدم</CardTitle>
        <CardDescription>
          اختر اسماً مميزاً سيظهر في المحادثات وعبر المنصة
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-right">
            <Label htmlFor="username">اسم المستخدم</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم المفضل لديك"
              required
              className="text-right"
              maxLength={20}
              disabled={isLoading || validating}
            />
            <div className="text-xs text-muted-foreground text-right">
              يجب أن يكون بين 3-20 حرف. يمكن استخدام الأحرف العربية والإنجليزية والأرقام.
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full gap-2" 
            disabled={isLoading || validating || !username.trim()}
          >
            {(isLoading || validating) ? 'جاري الحفظ...' : 'متابعة'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground text-center">
            <strong>نصائح:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• اختر اسماً يسهل تذكره</li>
              <li>• يمكنك تغيير اسم المستخدم لاحقاً من الإعدادات</li>
              <li>• سيظهر هذا الاسم في جميع رسائلك</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsernameRegistration;