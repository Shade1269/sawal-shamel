import { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { UnifiedCard, UnifiedButton } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTwoFactorAuth } from '@/hooks/useTwoFactorAuth';

interface TwoFactorVerificationProps {
  onVerified: () => void;
  onCancel?: () => void;
}

export function TwoFactorVerification({ onVerified, onCancel }: TwoFactorVerificationProps) {
  const { verify2FA, isLoading } = useTwoFactorAuth();
  const [code, setCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setError('');

    if (!code.trim()) {
      setError('الرجاء إدخال الرمز');
      return;
    }

    const success = await verify2FA(code.trim(), false);
    if (success) {
      onVerified();
    } else {
      setError('رمز خاطئ، حاول مرة أخرى');
      setCode('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <UnifiedCard className="w-full max-w-md">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">التحقق الثنائي</h2>
            <p className="text-sm text-muted-foreground">
              {isBackupCode
                ? 'أدخل أحد أكوادك الاحتياطية'
                : 'أدخل الرمز من تطبيق المصادقة'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Verification Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="2fa-code">
                {isBackupCode ? 'كود احتياطي' : 'رمز التحقق'}
              </Label>
              <Input
                id="2fa-code"
                type="text"
                placeholder={isBackupCode ? 'XXXXXXXX' : '000000'}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={isBackupCode ? 8 : 6}
                className="text-center text-2xl tracking-widest font-mono"
                autoFocus
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground text-center">
                {isBackupCode
                  ? 'الكود الاحتياطي مكون من 8 أحرف'
                  : 'الرمز مكون من 6 أرقام'}
              </p>
            </div>

            <UnifiedButton
              onClick={handleVerify}
              disabled={isLoading || !code.trim()}
              className="w-full"
            >
              {isLoading ? 'جاري التحقق...' : 'تحقق'}
            </UnifiedButton>
          </div>

          {/* Alternative Options */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  أو
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsBackupCode(!isBackupCode);
                setCode('');
                setError('');
              }}
              className="w-full text-sm text-primary hover:underline"
            >
              {isBackupCode
                ? 'استخدام رمز من تطبيق المصادقة'
                : 'استخدام كود احتياطي'}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                إلغاء
              </button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              <strong>نصيحة:</strong> إذا فقدت الوصول لتطبيق المصادقة، استخدم أحد الأكواد
              الاحتياطية التي تلقيتها عند إعداد المصادقة الثنائية.
            </p>
          </div>
        </div>
      </UnifiedCard>
    </div>
  );
}
